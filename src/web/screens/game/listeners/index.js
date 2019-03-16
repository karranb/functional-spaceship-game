/* global performance, requestAnimationFrame */
import {
  selectSpaceshipDestination as selectAISpaceshipDestination,
  selectSpaceshipTarget as selectAISpaceshipTarget,
} from '_ai/dumb'
import { isUser } from '_models/player/functions'
import {
  addChild,
  rotate as rotateElement,
  setPosition,
  removeChild,
  dettachCursor,
  newTicker,
} from '_web/graphic'
import { isStill } from '_models/spaceship/functions'
import Path from '_web/components/spaceship/path'
import MovingArea from '_web/components/spaceship/movingArea'
import Target from '_web/components/spaceship/target'
import { compose, map } from '_utils/functions/base'
import { Bullet as BulletGraphic } from '_web/components/spaceship/bullet'
import {
  getSelectedSpaceship,
  replaceSelectedSpaceship,
  update,
  selectSpaceship,
  selectSpaceshipDestination,
  selectSpaceshipTarget,
} from '_models/engine/functions'
import Coordinate from '_models/coordinate'

import {
  activateSpaceshipsSelection,
  activateTargetSelection,
  activateReadyBtn,
  activateMovingAreaSelection,
  deactivateTargetSelection,
  deactivateReadyBtn,
  deactivateSpaceshipsSelection,
} from '../controller'



import { Spaceship as SpaceshipGraphic, MovingSpaceship, ExplodingSpaceship } from '_web/components/spaceship'
import { either } from '_utils/functions/maybe';
import { getUser } from '../../../../models/engine/functions';


const mapMaybe = fn => maybe => maybe.map(fn)
const assignState = state => element => element.assignState(state)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp(prop)
const cEither = other => maybe => either(maybe, other)

const removeSpaceshipGraphic = graphic => spaceship => compose(
  () => assignState({ element: null })(spaceship),
  mapMaybe(removeChild(graphic)),
  getProp('element')
)(spaceship)

const createGraphicAndSetPosition = element => elementConstructor => coordinate => compose(
  setPosition(coordinate),
  elementConstructor
)(element)

const createAndAssignGraphic = graphic => elementConstructor => model =>
  compose(
    element => model.assignState({ element }),
    cEither(null),
    mapMaybe(addChild(graphic)),
    mapMaybe(createGraphicAndSetPosition(model)(elementConstructor)),
    getProp('coordinate'),
    removeSpaceshipGraphic(graphic),
  )(model)


const getSpaceships = (spaceships, otherPlayer) => compose(
  cEither(spaceships),
  mapMaybe(otherSpaceships => ([
    ...spaceships,
    ...otherSpaceships,
  ])),
  getProp('spaceships')
)(otherPlayer)

const AIFunctions = otherSpaceships => spaceship => compose(
  selectAISpaceshipTarget(otherSpaceships),
  selectAISpaceshipDestination
)(spaceship)

const setAIRoundStart = otherPlayers => player => {
  const otherSpaceships = otherPlayers.reduce(getSpaceships, [])
  return compose(
    spaceships => player.assignState({ spaceships }),
    cEither([]),
    mapMaybe(spaceships => spaceships.map(AIFunctions(otherSpaceships))),
    getProp('spaceships')
  )(player)
}

const removeSpaceshipTarget = graphic => spaceship => compose(
  always(spaceship.assignState({ target: null })),
  mapMaybe(removeChild(graphic)),
  getProp('target')
)(spaceship)

const removeSpaceshipPath = graphic => spaceship => compose(
  always(spaceship.assignState({ path: null })),
  mapMaybe(removeChild(graphic)),
  getProp('path')
)(spaceship)

const removeSpaceshipPathTarget = graphic => spaceship => compose(
  removeSpaceshipPath(graphic),
  removeSpaceshipTarget(graphic)
)(spaceship)


const addAndReturnElement = graphic => element => compose(
  always(element),
  addChild(graphic)
)(element)

const createSpaceshipBullet = graphic => bullet => compose(
  element => bullet.assignState({ element, onMove: onBulletMove, onDestroy: onDestroyBullet(graphic) }),
  addAndReturnElement(graphic),
  BulletGraphic
)(bullet)

const createSpaceshipBullets = graphic => spaceship =>
  compose(
    bullets => spaceship.assignState({ bullets }),
    cEither([]),
    mapMaybe(bullets => bullets.map(bullet => createSpaceshipBullet(graphic)(bullet))),
    getProp('bullets')
  )(spaceship)

const setRoundStartGraphics = graphic => player => {
  const setSpaceshipRoundGraphic = compose(
    spaceship => isStill(spaceship) ? spaceship : createAndAssignGraphic(graphic)(MovingSpaceship)(spaceship),
    createSpaceshipBullets(graphic),
    removeSpaceshipPathTarget(graphic),
  )
  return compose(
    spaceships => player.assignState({ spaceships }),
    cEither([]),
    mapMaybe(spaceships => map(spaceships, setSpaceshipRoundGraphic)),
    getProp('spaceships')
  )(player)
}


const updateTicker = engine => {
  const newTicker = engine.getProp('ticker').map(ticker => {
    ticker.update(performance.now())
    // console.log(`FPS: ${ticker.FPS}`)
    return ticker
  })
  return engine.assignState({ ticker: newTicker})
}

const removeMovingArea = graphic => engine => compose(
  always(engine.assignState({ movingArea: null })),
  mapMaybe(removeChild(graphic)),
  getProp('movingArea'),
)(engine)

const createSpaceshipPath = graphic => spaceship =>
  compose(
    path => spaceship.assignState({ path }),
    addChild(graphic),
    Path
  )(spaceship)

const replaceSpaceshipPath = graphic =>
  compose(
    createSpaceshipPath(graphic),
    removeSpaceshipPath(graphic),
    getSelectedSpaceship
  )

const setPlayerStartGraphics = graphic => players => player => {
  const startGraphicFn = setRoundStartGraphics(graphic)
  if (isUser(player)) return startGraphicFn(player)
  const otherPlayers = players.filter(otherPlayer => otherPlayer !== player)
  return startGraphicFn(setAIRoundStart(otherPlayers)(player))
}
  
const setPlayersStartGraphics = graphic => engine =>
  compose(
    cEither([]),
    mapMaybe(players => map(players, setPlayerStartGraphics(graphic)(players))),
    getProp('players')
  )(engine)

const createSpaceshipTarget = graphic => spaceship =>
  compose(
    target => spaceship.assignState({ target }),
      addChild(graphic),
      Target
  )(spaceship)

const replaceSpaceshipTarget = graphic => engine => compose(
  createSpaceshipTarget(graphic),
  removeSpaceshipTarget(graphic),
  getSelectedSpaceship
)(engine)

const always = x => () => x

const assignAndActivateMovingArea = engine => graphic => movingArea => compose(
  activateMovingAreaSelection(movingArea)(graphic),
  always(engine.assignState({ movingArea }))
)(movingArea)

export const onSelectSpaceship = graphic => spaceship => engine => compose(
  assignAndActivateMovingArea(engine)(graphic),
  addChild(graphic),
  always(MovingArea(spaceship))
)(engine)

export const onStartUpdate = graphic => engine => {
  const ticker = newTicker()
  const players = setPlayersStartGraphics(graphic)(engine)
  const newEngine = engine.assignState({ ticker, players })
  return update(newEngine)
}


/**
 * @param Engine
 */
export const onUpdate = engine => 
  compose(
    engine => requestAnimationFrame(() => update(engine)),
    updateTicker,
  )(engine)

/**
 *  Todo
 * @param {*} engine 
 */
export const onGameEnd = engine => engine

/**
 * @param engine
 */
export const onNewRound = engine =>
  compose(
    activateReadyBtn,
    activateSpaceshipsSelection
  )(engine)
  

export const onSpaceshipSelect = spaceship =>
  compose(
    deactivateReadyBtn,
    deactivateSpaceshipsSelection,
    selectSpaceship(spaceship)
  )

export const onMovingAreaSelect = e => graphic => engine => {
  const { x, y } = e.data.global
  const destination = Coordinate(x, y)

  return compose(
    activateTargetSelection(graphic),
    removeMovingArea(graphic),
    spaceship => replaceSelectedSpaceship(spaceship)(engine),
    replaceSpaceshipPath(graphic),
    selectSpaceshipDestination(destination)
  )(engine)
}

export const onTargetSelect = graphic => engine => e => {
  const { x, y } = e.data.global
  const targetCoordinate = Coordinate(x, y)
  dettachCursor(graphic)

  return compose(
    activateReadyBtn,
    activateSpaceshipsSelection,
    deactivateTargetSelection,
    flip(replaceSelectedSpaceship)(engine),
    replaceSpaceshipTarget(graphic),
    selectSpaceshipTarget(targetCoordinate)
  )(engine)
}


/**
 * Bullet Listeners
 */
export const onBulletMove = bullet =>
  compose(
    always(bullet),
    bullet.getPropsAndMap('coordinate', 'element'),
    always((coordinate, element) => {
      return setPosition(coordinate)(element)
    })
  )()

  
export const onDestroyBullet = graphic => bullet => compose(
  always(bullet),
  mapMaybe(removeChild(graphic)),
  getProp('element'),
)(bullet)

/**
 * Spaceship Listeners
 */
export const onSpaceshipStop = graphic => spaceship => {
  const isDestroyed = compose(
    cEither(false),
    getProp('isDestroyed')
  )(spaceship)
  if (isDestroyed) return spaceship
  return createAndAssignGraphic(graphic)(SpaceshipGraphic)(spaceship) 
}

export const onRotate = spaceship => {
  spaceship.getPropsAndMap('rotation', 'element')(
    (rotation, element) => rotateElement(rotation)(element)
  )
  return spaceship
}

export const onSetCoordinate = spaceship => {
  spaceship.getPropsAndMap('coordinate', 'element')(
    (coordinate, element) => setPosition(coordinate)(element)
  )
  return spaceship
}

export const onDestroySpaceship = graphic => spaceship => compose(
  always(spaceship),
  always(createAndAssignGraphic(graphic)(ExplodingSpaceship(graphic))(spaceship)),
  mapMaybe(removeChild(graphic)),
  getProp('element')
)(spaceship)
