import Coordinate from '_models/coordinate'
import { getVelFactor } from '_utils/spatial'
import { X_AXIS, Y_AXIS, BULLET_SPEED, BULLET_SIZE } from '_utils/constants'
import { compose, curry } from '_utils/base'
import { callListenerIfExist } from '_utils/helper'
import { add, mult } from '_utils/math'
import { fEither } from '_utils/logic'
import { assignState, getObjPropsAndMap, getPropsAndMap } from '_utils/model'

/**
 * Set a position to the bullet
 * 
 * (Coordinate, Bullet) -> Bullet
 * 
 */
const setPosition = curry((coordinate, bullet) =>
  compose(
    callListenerIfExist('onMove'),
    assignState({ coordinate })
  )(bullet)
)

/**
 * Calc the bullet new position and set it
 * 
 * (Bullet, Number, Number) ->  Bullet
 */
const setCoordinateToBullet = (bullet, x, y) => setPosition(Coordinate(x, y), bullet)

const calcAndSetPositionFn = (bullet, coordinate, velX, velY) =>
  setCoordinateToBullet(bullet, add(coordinate.x(), velX), add(coordinate.y(), velY))

const calcAndSetPosition = curry(calcAndSetPositionFn)

export const calcVel = (state, constructor) =>
  compose(getAxisFactor =>
    constructor({
      ...state,
      size: BULLET_SIZE,
      velX: mult(getAxisFactor(X_AXIS), BULLET_SPEED),
      velY: mult(getAxisFactor(Y_AXIS), BULLET_SPEED),
    })
  )(getObjPropsAndMap(state)('coordinate', 'destination')(getVelFactor))

/**
 * Update the bullet state
 */
export const update = bullet =>
  compose(
    fEither(bullet),
    getPropsAndMap(bullet)('coordinate', 'velX', 'velY'),
    calcAndSetPosition
  )(bullet)
