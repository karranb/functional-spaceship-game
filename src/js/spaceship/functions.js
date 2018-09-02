import Path from '_spaceship/path'
import Target from '_spaceship/target'
import Bullet from '_spaceship/bullet'
import Spaceship from '_spaceship/index'
import Coordinate from '_utils/coordinate'
import {
  checkOutBounds,
  checkCollisionSquareCircle,
  checkCollisionBetweenPolygons,
} from '_utils/functions/helper'

import { diff } from '_utils/functions/helper'


import { SPACE_SHIP_SIZES, X_AXIS, Y_AXIS } from '_utils/constants'
import {
  getCoordinate,
  getDestination,
  getSize,
  getRotation,
  newDestination,
  newCoordinate,
  areEqualCoordinates,
  // getDistance,
  move,
  getVelFactor,
} from '_utils/functions/spatial'


export const rotate = (state, rad) => {
  const { el } = state
  el.rotation = rad
  return Spaceship({ ...state, rotation: rad })
}

export const spaceshipSpatialFunctions = state => ({
  newDestination: destination => {
    const { coordinate } = state
    const tx = destination.x() - coordinate.x()
    const ty = destination.y() - coordinate.y()
    return Spaceship(newDestination(state, destination)).rotate(Math.atan2(ty, tx))
  },
  newCoordinate: coordinate => Spaceship(newCoordinate(state, coordinate)),
  getCoordinate: () => getCoordinate(state),
  getDestination: () => getDestination(state),
  isReady: () =>
    (state.destroyed ||
      !state.destination ||
        state.coordinate.equals(state.destination)) &&
    !state.bullets.length,
  isStill: () => !state.destination || areEqualCoordinates(state.coordinate, state.destination),
  removePath: canvas => {
    if (state.path) {
      canvas.removeChild(state.path)
    }
    return Spaceship({
      ...state,
      path: null,
    })
  },
  removeTarget: canvas => {
    if (state.target) {
      canvas.removeChild(state.target)
    }
    return Spaceship({
      ...state,
      target: null,
    })
  },
  newPath: canvas => {
    const path = Path({
      coordinate: getCoordinate(state),
      destination: getDestination(state),
    })
    if (state.path) {
      canvas.removeChild(state.path)
    }
    canvas.addChild(path.draw())
    return Spaceship({ ...state, path })
  },
  setColor: color => Spaceship({ ...state, color }),
  newTarget: (location, canvas) => {
    const target = Target({
      coordinate: location,
    })
    if (state.target) {
      canvas.removeChild(state.target)
    }
    const bullet = Bullet({
      coordinate: Coordinate(getCoordinate(state).x(), getCoordinate(state).y()),
      destination: location,
      power: 300,
    })
    const bullets = [bullet]
    canvas.addChild(target.draw())
    canvas.addChild(bullet)
    return Spaceship({
      ...state,
      target,
      bullets,
    })
  },
  getSize: () => getSize(state),
  getRotation: () => getRotation(state),
  reduceShield: damage => {
    const shield = state.shield - damage
    if (shield < 0) {
      return Spaceship({
        ...state,
        shield,
        destroyed: true,
      })
    }
    return Spaceship({
      ...state,
      shield,
    })
  },
  isDestroyed: () => state.destroyed,
  destroy: () => Spaceship({
    ...state,
    destroyed: true,
  }),
})

export const select = state => Spaceship({
  ...state,
  selected: true,
})

export const disselect = state => Spaceship({
  ...state,
  selected: false,
})

export const isSelected = state => !!state.selected

export const draw = state => {
  const { el, color } = state
  el.beginFill(color)
  el.drawRect(0, 0, SPACE_SHIP_SIZES.w(), SPACE_SHIP_SIZES.h())
  el.endFill()

  el.pivot.x = SPACE_SHIP_SIZES.w() / 2
  el.pivot.y = SPACE_SHIP_SIZES.h() / 2

  el.x = state.coordinate.x()
  el.y = state.coordinate.y()
  return Spaceship({
    ...state,
  })
}

export const update = state => {
  const bullets = state.bullets.map(bullet => bullet.update())

  const { destination, coordinate } = state

  if (!destination) {
    return Spaceship({
      ...state,
      bullets,
    })
  }
  const vel = 2
  const newPosition = move(coordinate, destination)(vel)

  const { el } = state
  el.x = newPosition.x()
  el.y = newPosition.y()

  return Spaceship({
    ...state,
    el,
    bullets,
    coordinate: newPosition,
  })
}

const processCollisionWithSpaceship = spaceship => otherSpaceship => {
  if (checkCollisionBetweenPolygons(spaceship, otherSpaceship)) {
    if (spaceship.isStill()) {
      return spaceship.destroy()
    }
    return spaceship.reduceShield(20)
  }
  return spaceship
}

const processCollisionsWithBullets = (spaceship, bullet) => {
  return checkCollisionSquareCircle(spaceship)(bullet) ?
    spaceship.reduceShield(bullet.getState().power) : spaceship
}

export const processCollisions = spaceship => otherSpaceships => {
  const isOnTrack = bullet => !bullet.checkCollisions(otherSpaceships) && !checkOutBounds(bullet)
  const oldBullets = spaceship.getState().bullets
  const bullets = oldBullets.filter(isOnTrack)

  const processSpaceshipCollisions = (unprocessedSpaceship, otherSpaceship) => {
    const processedSpaceship = otherSpaceship
      .getState().bullets.reduce(processCollisionsWithBullets, unprocessedSpaceship)
    return processCollisionWithSpaceship(processedSpaceship)(otherSpaceship)
  }

  const spaceshipWithProcessedBullets = Spaceship({ ...spaceship.getState(), bullets })
  const newSpaceship = otherSpaceships
    .reduce(processSpaceshipCollisions, spaceshipWithProcessedBullets)

  return newSpaceship
}
