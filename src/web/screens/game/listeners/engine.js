/* global requestAnimationFrame */
import {
  selectSpaceshipDestination as selectAISpaceshipDestination,
  selectSpaceshipTarget as selectAISpaceshipTarget,
} from '_ai/dumb'
import { isUser } from '_models/player/functions'
import { addChild, setPosition, removeChild, newTicker } from '_web/graphic'
import { isStill } from '_models/spaceship/functions'
import { compose, map, reduce, hashedFns } from '_utils/base'
import { Bullet as BulletGraphic } from '_web/components/spaceship/bullet'
import { update } from '_models/engine/functions'
import { MovingSpaceship } from '_web/components/spaceship'
import { fEither } from '_utils/logic'
import { assignState, getProp } from '_utils/model'
import { always } from '_utils/helper'
import { add, div } from '_utils/math'

import { activateSpaceshipsSelection, activateReadyBtn } from '../controller'

import { onBulletMove, onDestroyBullet } from './bullet'

const removeSpaceshipGraphic = graphicController => spaceship =>
  compose(
    () => assignState({ graphic: null })(spaceship),
    map(removeChild(graphicController)),
    getProp('graphic')
  )(spaceship)

const createGraphicAndSetPosition = graphic => graphicConstructor => coordinate =>
  compose(
    setPosition(coordinate),
    graphicConstructor
  )(graphic)

const createAndAssignGraphic = graphicController => graphicConstructor => model =>
  compose(
    graphic => model.assignState({ graphic }),
    fEither(null),
    map(addChild(graphicController)),
    map(createGraphicAndSetPosition(model)(graphicConstructor)),
    getProp('coordinate'),
    removeSpaceshipGraphic(graphicController)
  )(model)

const getSpaceships = (spaceships, otherPlayer) =>
  compose(
    fEither(spaceships),
    map(otherSpaceships => [...spaceships, ...otherSpaceships]),
    getProp('spaceships')
  )(otherPlayer)

const AIFunctions = otherSpaceships => spaceship =>
  compose(
    selectAISpaceshipTarget(otherSpaceships),
    selectAISpaceshipDestination
  )(spaceship)

const setAIRoundStart = otherPlayers => player => {
  const otherSpaceships = otherPlayers.reduce(getSpaceships, [])
  return compose(
    spaceships => player.assignState({ spaceships }),
    fEither([]),
    map(spaceships => spaceships.map(AIFunctions(otherSpaceships))),
    getProp('spaceships')
  )(player)
}

const removeSpaceshipTarget = graphicController => spaceship =>
  compose(
    always(spaceship.assignState({ target: null })),
    map(removeChild(graphicController)),
    getProp('target')
  )(spaceship)

const removeSpaceshipPath = graphicController => spaceship =>
  compose(
    always(spaceship.assignState({ path: null })),
    map(removeChild(graphicController)),
    getProp('path')
  )(spaceship)

const removeSpaceshipPathTarget = graphicController => spaceship =>
  compose(
    removeSpaceshipPath(graphicController),
    removeSpaceshipTarget(graphicController)
  )(spaceship)

const addAndReturnGraphic = graphicController => graphic =>
  compose(
    always(graphic),
    addChild(graphicController)
  )(graphic)

const createSpaceshipBullet = graphicController => bullet =>
  compose(
    graphic =>
      bullet.assignState({
        graphic,
        onMove: onBulletMove,
        onDestroy: onDestroyBullet(graphicController),
      }),
    addAndReturnGraphic(graphicController),
    BulletGraphic
  )(bullet)

const createSpaceshipBullets = graphicController => spaceship =>
  compose(
    bullets => spaceship.assignState({ bullets }),
    fEither([]),
    map(bullets => bullets.map(bullet => createSpaceshipBullet(graphicController)(bullet))),
    getProp('bullets')
  )(spaceship)

const setRoundStartGraphics = graphicController => player => {
  const setSpaceshipRoundGraphic = compose(
    spaceship =>
      isStill(spaceship)
        ? spaceship
        : createAndAssignGraphic(graphicController)(MovingSpaceship)(spaceship),
    createSpaceshipBullets(graphicController),
    removeSpaceshipPathTarget(graphicController)
  )
  return compose(
    spaceships => player.assignState({ spaceships }),
    fEither([]),
    map(spaceships => map(setSpaceshipRoundGraphic, spaceships)),
    getProp('spaceships')
  )(player)
}

const logAndClearFPSList = FPSList =>
  compose(
    always([]),
    console.log, // eslint-disable-line no-console
    sum => div(sum, FPSList.length),
    reduce(add, 0)
  )(FPSList)

const processFPS = (FPS, engine) =>
  compose(
    fEither([]),
    map(FPSList =>
      hashedFns({
        true: () => logAndClearFPSList(FPSList),
        false: () => FPSList,
      })(FPSList.length >= 100)
    ),
    map(FPSList => [...FPSList, FPS]),
    getProp('FPSList')
  )(engine)

const updateTicker = engine =>
  compose(
    fEither(engine),
    map(ticker => {
      ticker.update()
      return engine.assignState({
        FPSList: processFPS(ticker.FPS, engine),
      })
    }),
    getProp('ticker')
  )(engine)

const setPlayerStartGraphics = graphicController => players => player => {
  const startGraphicFn = setRoundStartGraphics(graphicController)
  if (isUser(player)) return startGraphicFn(player)
  const otherPlayers = players.filter(otherPlayer => otherPlayer !== player)
  return startGraphicFn(setAIRoundStart(otherPlayers)(player))
}

const setPlayersStartGraphics = graphicController => engine =>
  compose(
    fEither([]),
    map(players => map(setPlayerStartGraphics(graphicController)(players), players)),
    getProp('players')
  )(engine)

export const onStartUpdate = graphicController => engine => {
  const ticker = newTicker()
  const players = setPlayersStartGraphics(graphicController)(engine)
  const newEngine = engine.assignState({ ticker, players })
  return update(newEngine)
}

export const onUpdate = engine =>
  compose(
    newEngine => requestAnimationFrame(() => update(newEngine)),
    updateTicker
  )(engine)

export const onGameEnd = engine => engine

export const onNewRound = engine =>
  compose(
    activateReadyBtn,
    activateSpaceshipsSelection
  )(engine)
