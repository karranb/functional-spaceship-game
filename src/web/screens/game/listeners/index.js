/* global performance, requestAnimationFrame */
import {
  selectSpaceshipDestination as selectAISpaceshipDestination,
  selectSpaceshipTarget as selectAISpaceshipTarget,
} from '_ai/dumb'
import Engine from '_models/engine'
import Player from '_models/player'
import { isUser } from '_models/player/functions'
import Spaceship from '_models/spaceship'
import {
  addChild,
  rotate as rotateElement,
  setPosition,
  removeChild,
  dettachCursor,
  newTicker,
} from '_web/graphic'
import Bullet from '_models/bullet'
import Path from '_web/components/spaceship/path'
import MovingArea from '_web/components/spaceship/movingArea'
import Target from '_web/components/spaceship/target'
import { compose } from '_utils/functions/base'
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
import { getPropsAndMap, either } from '_utils/functions/maybe';


/**
 * Controller Listeners
 */

export const onSpaceshipSelect = spaceship => engine =>
  compose(
    deactivateReadyBtn,
    deactivateSpaceshipsSelection,
    selectSpaceship(spaceship)
  )(engine)

export const onMovingAreaSelect = e => engine => {
  const { x, y } = e.data.global
  const destination = Coordinate(x, y)
  return compose(
    activateTargetSelection,
    selectSpaceshipDestination(destination)
  )(engine)
}

export const onTargetSelect = e => engine => {
  const { x, y } = e.data.global
  const targetCoordinate = Coordinate(x, y)
  return compose(
    activateSpaceshipsSelection,
    deactivateTargetSelection,
    selectSpaceshipTarget(targetCoordinate)
  )(engine)
}

/**
 * Bullet Listeners
 */
//todo uncurry setposition or curry getProps and map
export const onBulletMove = bullet => 
  either(
    getPropsAndMap(bullet)((coordinate, element) => setPosition(coordinate)(element))('coordinate', 'element'),
    bullet
  )

export const onDestroyBullet = graphic => bullet => {
  bullet.getProp('element').map(element => removeChild(element))(graphic)
  return bullet
}

/**
 * Spaceship Listeners
 */

 export const onSpaceshipStop = graphic => spaceship => {
  const newSpaceship = getPropsAndMap(spaceship)((isDestroyed, oldElement, coordinate) => {
    if (isDestroyed) return spaceship
    removeChild(oldElement)(graphic)
    const element = setPosition(coordinate)(SpaceshipGraphic(spaceship))
    addChild(element)(graphic)
    return spaceship.assignState({ element })
  })('isDestroyed', 'element', 'coordinate')
  return either(newSpaceship, spaceship)
}

export const onRotate = spaceship => {
  const newSpaceship = getPropsAndMap(spaceship)((rotation, element) => {
    rotateElement(rotation)(element)
  })('rotate', 'element')
  return either(newSpaceship, spaceship) 
}

export const onSetCoordinate = spaceship => {
  const newSpaceship = getPropsAndMap(spaceship)((coordinate, element) => {
    setPosition(coordinate)(element)
  })('coordinate', 'element')
  return either(newSpaceship, spaceship)
}

export const onDestroySpaceship = graphic => spaceship => {
  spaceship.getProp('element').map(element => removeChild(element)(graphic))
  addChild(ExplodingSpaceship(spaceship)(graphic))(graphic)
  return spaceship
}

/**
 * Engine Listeners
 */

const setAIRoundStart = otherPlayers => player => {
  const getSpaceships = (spaceships, otherPlayer) => either(
    otherPlayer.getProp('spaceships').map(otherSpaceships => ([
      ...spaceships,
      ...otherSpaceships,
    ])), spaceships)
    
  const otherSpaceships = otherPlayers.reduce(getSpaceships, [])
  const AIFunctions = compose(
    selectAISpaceshipTarget(otherSpaceships),
    selectAISpaceshipDestination
  )
  const spaceships = either(player.getProp('spaceships').map(spaceships => spaceships.map(AIFunctions)), [])
  return player.assignState({ spaceships })
}

const setRoundStartGraphics = graphic => player => {
  const spaceships = player.getProp('spaceships').map(spaceships => spaceships.map(
    spaceship => 
      getPropsAndMap(spaceship)((target, path, bullets) => {
        if (target) {
          removeChild(target)(graphic)
        }
        if (path) {
          removeChild(path)(graphic)
        }
        const newBullets = bullets.map(bullet => {
          const element = BulletGraphic(bullet)
          addChild(element)(graphic)
          bullet.assignState({ element, onMove: onBulletMove, onDestroy: onDestroyBullet(graphic)})
        })
        const stoppedSpaceship = getPropsAndMap(player)((element, coordinate) => {
          removeChild(element)(graphic)
          const newElement = setPosition(coordinate)(MovingSpaceship(spaceship))
          addChild(newElement)(graphic)
          return spaceship.assignState({
            path: null,
            target: null,
            bullets: newBullets,
            element: newElement
          })
        })('element', 'coordinate', 'destination',  )
        return either(
          stoppedSpaceship,
          spaceship.assignState({ path: null, target: null, bullets: newBullets })
        )    
      })('target', 'path', 'bullets')      
  ))
  if (isNothing(spaceships)) {
    return player
  }
  return player.assignState({ spaceships })
}

export const onSetDestination = graphic => engine => {
  const newEngine = engine.getProp('movingArea').map(movingArea => {
    const newEngine = engine.assignState({ movingArea: null })
    const spaceship = getSelectedSpaceship(newEngine)
    const newSpaceship = either(spaceship.getProp('path').map(path => {
      const newPath = Path(spaceship)
      addChild(newPath)(graphic)
      removeChild(path)(graphic)
      return spaceship.assignState({ path: newPath })
    }), spaceship)
    removeChild(movingArea)(graphic)
    return replaceSelectedSpaceship(newSpaceship)(newEngine)
  })
  return either(newEngine, engine)
}

export const onSelectSpaceship = graphic => spaceship => engine => {
  const movingArea = MovingArea(spaceship)
  addChild(movingArea)(graphic)
  const newEngine = engine.assignState({ movingArea })
  return activateMovingAreaSelection(movingArea)(newEngine)
}

export const onStartUpdate = graphic => engine => {
  const ticker = newTicker()
  const players = either(engine.getProp('players').map(players =>
    players.map(player => {
      if (isUser(player)) return setRoundStartGraphics(graphic)(player)
      const otherPlayers = players.filter(otherPlayer => otherPlayer !== player)
      return setRoundStartGraphics(graphic)(setAIRoundStart(otherPlayers)(player))
    })
  ), [])
  return update(engine.assignState({ ticker, players }))
}

export const onSetTarget = graphic => engine => {
  dettachCursor(graphic)
  const spaceship = getSelectedSpaceship(engine)
  const newSpaceship = either(
    spaceship.getProp('target').map(target => {
      if (target) {
        removeChild(target)(graphic)
      }
      const newTarget = Target(spaceship)
      addChild(newTarget)(graphic)
      return spaceship.assignState({ target: newTarget })
    }),
    spaceship
  )
  return compose(
    activateReadyBtn,
    replaceSelectedSpaceship(newSpaceship),
    activateSpaceshipsSelection,
    deactivateTargetSelection
  )(engine)
}

export const onUpdate = engine => {
  engine.getProp('ticker').map(ticker => {
    ticker.update(performance.now())
    // console.log(`FPS: ${ticker.FPS}`)
  })
  requestAnimationFrame(() => update(engine))
}

export const onGameEnd = engine => engine

export const onNewRound = engine =>
  compose(
    activateReadyBtn,
    activateSpaceshipsSelection
  )(engine)
