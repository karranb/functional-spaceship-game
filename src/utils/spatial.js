import Coordinate from '_models/coordinate'
import Size from '_models/size'
import { X_AXIS, Y_AXIS, GAME_SIZE } from '_utils/constants'

import { compose, hashedFns, curry, reduce } from './base'
import { not, and, eq, lte, lt, gt, or, either, fEither } from './logic'
import { add, mult, sub, div, pow } from './math'
import { getProp } from './model'
import { always } from './helper'

export const scaleSize = curry((scale, size) => Size(mult(size.w(), scale), mult(size.h(), scale)))

export const getRotation = compose(
  fEither(0),
  getProp('rotation')
)

// either(getProp('rotation'), 0)

export const areEqualCoordinates = (coordinate1, coordinate2) =>
  and(eq(coordinate1.x(), coordinate2.x()), eq(coordinate1.y(), coordinate2.y()))

const subSqr = curry((x, y) => pow(sub(x, y), 2))

export const getDistance = curry((coord1, coord2) =>
  Math.sqrt(add(subSqr(coord1.y(), coord2.y()), subSqr(coord1.x(), coord2.x())))
)

export const getVelFactor = curry((coord1, coord2, axis) =>
  div(sub(coord2[axis](), coord1[axis]()), getDistance(coord1, coord2))
)

export const getVelFactors = (coordinate, destination) =>
  reduce(
    (acc, axis) => ({
      ...acc,
      [axis]: getVelFactor(coordinate, destination, axis),
    }),
    {},
    [X_AXIS, Y_AXIS]
  )

export const getAngle = (coord1, coord2) =>
  Math.atan2(sub(coord1.y(), coord2.y()), sub(coord1.x(), coord2.x()))

const isVelLteDist = (coord, vel, dest) => lte(Math.abs(vel), Math.abs(sub(coord, dest)))

export const processAxisMovePosition = (vel, axisVelFactor, coord, dest) =>
  compose(
    axisVel =>
      hashedFns({
        true: () => add(axisVel, coord),
        false: always(dest),
      })(isVelLteDist(coord, axisVel, dest)),
    mult(vel)
  )(axisVelFactor)

export const processMove = (coord, dest, velFactors, vel) =>
  hashedFns({
    true: always(dest),
    false: () =>
      Coordinate(
        processAxisMovePosition(vel, velFactors[X_AXIS], coord.x(), dest.x()),
        processAxisMovePosition(vel, velFactors[Y_AXIS], coord.y(), dest.y())
      ),
  })(areEqualCoordinates(coord, dest))

export const move = (coordinate, destination) =>
  compose(velFactors => (vel, currentCoordinate = coordinate) =>
    hashedFns({
      true: always(currentCoordinate),
      false: () => processMove(currentCoordinate, destination, velFactors, vel),
    })(not(destination))
  )(getVelFactors(coordinate, destination))

const ltZero = x => lt(x, 0)

const isSumLtZero = curry((x, y) => ltZero(add(x, y)))

const isSubGt = curry((x, y, z) => gt(sub(x, y), z))

const isOutBounds = (coordinate, size) =>
  compose(
    or(isSubGt(coordinate.y(), size.h(), GAME_SIZE.h())),
    or(isSumLtZero(coordinate.y(), size.h())),
    or(isSubGt(coordinate.x(), size.w(), GAME_SIZE.w()))
  )(isSumLtZero(coordinate.x(), size.w()))

export const checkOutBounds = el =>
  either(el.getPropsAndMap('coordinate', 'size')(isOutBounds), true)
