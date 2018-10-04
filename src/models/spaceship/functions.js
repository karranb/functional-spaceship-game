import {
  checkOutBounds,
  checkCollisionSquareCircle,
  checkCollisionBetweenPolygons,
  areEqualCoordinates,
  move,
} from '_utils/functions/spatial'
import {
  update as updateBullet,
  checkCollisions as checkBulletCollisions,
} from '_models/bullet/functions'
import { SPACESHIP_COLLISION_DAMAGE } from '_utils/constants'
import Bullet from '_models/bullet'

import Spaceship from './index'

export const rotate = rad => spaceship => {
  const state = spaceship.getState()
  const rotatedSpaceship = Spaceship({ ...state, rotation: rad })
  state.onRotate(rotatedSpaceship)
  return rotatedSpaceship
}

export const isStill = spaceship => {
  const state = spaceship.getState()
  return !state.destination || areEqualCoordinates(state.coordinate, state.destination)
}

export const isReady = spaceship => {
  const state = spaceship.getState()
  return (state.destroyed || isStill(spaceship)) && !state.bullets.length
}

export const destroy = spaceship =>
  spaceship.getState().onDestroy(
    Spaceship({
      ...spaceship.getState(),
      destroyed: true,
    })
  )

export const reduceShield = damage => spaceship => {
  const state = spaceship.getState()
  const shield = state.shield - damage
  if (shield < 0) {
    return destroy(spaceship)
  }
  return Spaceship({
    ...state,
    shield,
  })
}

export const isAlive = spaceship => !spaceship.getState().destroyed

export const isDestroyed = spaceship => spaceship.getState().destroyed

export const setTarget = target => spaceship => {
  const state = spaceship.getState()
  const { coordinate } = state
  const bullet = Bullet({
    coordinate,
    destination: target,
    power: 300,
  })
  const bullets = [bullet]
  return Spaceship({
    ...state,
    bullets,
    targetCoordinate: target,
  })
}

export const setCoordinate = coordinate => spaceship => {
  const state = spaceship.getState()
  const positionatedSpaceship = Spaceship({ ...state, coordinate })
  state.onSetCoordinate(positionatedSpaceship)
  return positionatedSpaceship
}

export const setDestination = destination => spaceship => {
  const state = spaceship.getState()
  const { coordinate } = state
  const tx = destination.x() - coordinate.x()
  const ty = destination.y() - coordinate.y()
  return rotate(Math.atan2(ty, tx))(
    Spaceship({
      ...state,
      destination,
    })
  )
}

export const select = spaceship =>
  Spaceship({
    ...spaceship.getState(),
    isSelected: true,
  })

export const disselect = spaceship =>
  Spaceship({
    ...spaceship.getState(),
    isSelected: false,
  })

export const isSelected = spaceship => spaceship.getState().isSelected
export const isNotSelected = spaceship => !spaceship.getState().isSelected

export const update = spaceship => {
  const state = spaceship.getState()
  const bullets = state.bullets.map(updateBullet)

  const { destination, coordinate } = state

  if (!destination) {
    return Spaceship({
      ...state,
      bullets,
    })
  }
  const vel = 2
  const newPosition = move(coordinate, destination)(vel)
  const movedSpaceship = setCoordinate(newPosition)(
    Spaceship({
      ...state,
      bullets,
    })
  )
  if (areEqualCoordinates(coordinate, destination)) {
    if (state.onStop) {
      return Spaceship({
        ...state.onStop(movedSpaceship).getState(),
        destination: null,
      })  
    }
    return Spaceship({
      ...movedSpaceship.getState(),
      destination: null,
    })
  }
  return movedSpaceship
}

const processCollisionWithSpaceship = spaceship => otherSpaceship => {
  if (
    isAlive(spaceship) &&
    isAlive(otherSpaceship) &&
    checkCollisionBetweenPolygons(spaceship, otherSpaceship)
  ) {
    if (isStill(spaceship)) {
      return destroy(spaceship)
    }
    return reduceShield(SPACESHIP_COLLISION_DAMAGE)(spaceship)
  }
  return spaceship
}

const processCollisionsWithBullets = (spaceship, bullet) =>
  isAlive(spaceship) && checkCollisionSquareCircle(spaceship)(bullet)
    ? reduceShield(bullet.getState().power)(spaceship)
    : spaceship

export const processCollisions = otherSpaceships => spaceship => {
  const otherAliveSpaceships = otherSpaceships.filter(isAlive)
  const isOnTrack = bullet =>
    !checkBulletCollisions(otherAliveSpaceships)(bullet) && !checkOutBounds(bullet)
  const oldBullets = spaceship.getState().bullets
  const bullets = oldBullets.filter(isOnTrack)

  const processSpaceshipCollisions = (unprocessedSpaceship, otherSpaceship) => {
    const processedSpaceship = otherSpaceship
      .getState()
      .bullets.reduce(processCollisionsWithBullets, unprocessedSpaceship)
    return processCollisionWithSpaceship(processedSpaceship)(otherSpaceship)
  }

  const spaceshipWithProcessedBullets = Spaceship({
    ...spaceship.getState(),
    bullets,
  })
  return otherSpaceships.reduce(processSpaceshipCollisions, spaceshipWithProcessedBullets)
}
