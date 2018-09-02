import Coordinate from '_models/coordinate'
import { checkCollisionSquareCircle } from '_utils/collision'
import { getVelFactor } from '_utils/spatial'
import { X_AXIS, Y_AXIS, BULLET_SPEED, BULLET_SIZE } from '_utils/constants'
import { compose, curry } from '_utils/base'
import { flip, callListenerIfExist } from '_utils/helper'
import { add, mult } from '_utils/math'
import { fEither } from '_utils/logic'
import { assignState, getPropsAndMap } from '_utils/model'
import { some } from '_utils/array'

import Bullet from './index'

/**
 * Set a position to the bullet
 */
const setPosition = curry((coordinate, bullet) =>
  compose(
    callListenerIfExist('onMove'),
    assignState({ coordinate })
  )(bullet)
)

/**
 * Calc the bullet new position and set it
 */
const setCoordinateToBullet = (bullet, x, y) => setPosition(Coordinate(x, y), bullet)

const calcAndSetPositionFn = (bullet, coordinate, velX, velY) =>
  setCoordinateToBullet(bullet, add(coordinate.x(), velX), add(coordinate.y(), velY))

const calcAndSetPosition = curry(calcAndSetPositionFn)

export const calcVel = state => (coordinate, destination) =>
  compose(getAxisFactor =>
    Bullet({
      ...state,
      size: BULLET_SIZE,
      velX: mult(getAxisFactor(X_AXIS), BULLET_SPEED),
      velY: mult(getAxisFactor(Y_AXIS), BULLET_SPEED),
    })
  )(getVelFactor(coordinate, destination))

/**
 * Update the bullet state
 */
export const update = bullet =>
  compose(
    fEither(bullet),
    getPropsAndMap(bullet)('coordinate', 'velX', 'velY'),
    calcAndSetPosition
  )(bullet)

/**
 * Check bullet collisions
 */
const checkCollisionCircleSquare = flip(checkCollisionSquareCircle)

export const checkCollisions = curry(
  (spaceships, bullet) =>
    some(checkCollisionCircleSquare(bullet), spaceships) && callListenerIfExist('onDestroy')(bullet)
)
