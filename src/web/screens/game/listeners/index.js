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

export const onBulletMove = bullet => {
  const { coordinate, element } = bullet.getState()
  return setPosition(coordinate)(element)
}

export const onDestroyBullet = graphic => bullet => {
  const { element } = bullet.getState()
  removeChild(element)(graphic)
  return bullet
}

/**
 * Spaceship Listeners
 */

export const onRotate = spaceship => {
  const { rotation, element } = spaceship.getState()
  return rotateElement(rotation)(element)
}

export const onSetCoordinate = spaceship => {
  const { coordinate, element } = spaceship.getState()
  return setPosition(coordinate)(element)
}

export const onDestroySpaceship = graphic => spaceship => {
  const { element } = spaceship.getState()
  removeChild(element)(graphic)
  return spaceship
}

/**
 * Engine Listeners
 */

const setAIRoundStart = otherPlayers => player => {
  const playerState = player.getState()
  const getSpaceships = (spaceships, otherPlayer) => [
    ...spaceships,
    ...otherPlayer.getState().spaceships,
  ]
  const otherSpaceships = otherPlayers.reduce(getSpaceships, [])
  const AIFunctions = compose(
    selectAISpaceshipTarget(otherSpaceships),
    selectAISpaceshipDestination
  )
  const spaceships = playerState.spaceships.map(AIFunctions)
  return Player({
    ...playerState,
    spaceships,
  })
}

const setRoundStartGraphics = graphic => player => {
  const playerState = player.getState()
  const spaceships = playerState.spaceships.map(spaceship => {
    const spaceshipState = spaceship.getState()
    const { target, path, bullets } = spaceshipState
    if (target) {
      removeChild(target)(graphic)
    }
    if (path) {
      removeChild(path)(graphic)
    }

    const newBullets = bullets.map(bullet => {
      const element = BulletGraphic(bullet)
      addChild(element)(graphic)
      const bulletState = bullet.getState()
      return Bullet({
        ...bulletState,
        element,
        onMove: onBulletMove,
        onDestroy: onDestroyBullet(graphic),
      })
    })
    return Spaceship({ ...spaceshipState, path: null, target: null, bullets: newBullets })
  })
  return Player({
    ...playerState,
    spaceships,
  })
}

export const onSetDestination = graphic => engine => {
  const state = engine.getState()
  const { movingArea } = state
  const newEngine = Engine({
    ...state,
    movingArea: null,
  })
  const spaceship = getSelectedSpaceship(newEngine)
  const spaceshipState = spaceship.getState()
  const { path } = spaceshipState
  if (path) {
    removeChild(path)(graphic)
  }
  removeChild(movingArea)(graphic)

  const newPath = Path(spaceship)
  addChild(newPath)(graphic)

  const newSpaceship = Spaceship({
    ...spaceshipState,
    path: newPath,
  })
  return replaceSelectedSpaceship(newSpaceship)(newEngine)
}

export const onSelectSpaceship = graphic => spaceship => engine => {
  const movingArea = MovingArea(spaceship)
  addChild(movingArea)(graphic)
  const state = engine.getState()
  const newEngine = Engine({ ...state, movingArea })
  return activateMovingAreaSelection(movingArea)(newEngine)
}

export const onStartUpdate = graphic => engine => {
  const ticker = newTicker()
  const state = engine.getState()
  const players = state.players.map(player => {
    if (isUser(player)) return setRoundStartGraphics(graphic)(player)
    const otherPlayers = state.players.filter(otherPlayer => otherPlayer !== player)
    return setRoundStartGraphics(graphic)(setAIRoundStart(otherPlayers)(player))
  })
  const newEngine = Engine({ ...state, ticker, players })
  return update(newEngine)
}

export const onSetTarget = graphic => engine => {
  dettachCursor(graphic)
  const spaceship = getSelectedSpaceship(engine)
  const spaceshipState = spaceship.getState()
  const { target } = spaceshipState
  if (target) {
    removeChild(target)(graphic)
  }
  const newTarget = Target(spaceship)
  addChild(newTarget)(graphic)
  const newSpaceship = Spaceship({
    ...spaceshipState,
    target: newTarget,
  })
  return compose(
    activateReadyBtn,
    replaceSelectedSpaceship(newSpaceship),
    activateSpaceshipsSelection,
    deactivateTargetSelection
  )(engine)
}

export const onUpdate = engine => {
  const { ticker } = engine.getState()
  ticker.update(performance.now())
  console.log(`FPS: ${ticker.FPS}`)
  requestAnimationFrame(() => update(engine))
}

export const onGameEnd = engine => engine

export const onNewRound = engine =>
  compose(
    activateReadyBtn,
    activateSpaceshipsSelection
  )(engine)
