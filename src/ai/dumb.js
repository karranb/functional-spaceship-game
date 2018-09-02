import Coordinate from '_models/coordinate'
import { setDestination, setTarget } from '_models/spaceship/functions'
import { randomBetween, sub, add, div, mult } from '_utils/math'
import { gt } from '_utils/logic'
import { always, flip } from '_utils/helper'
import { compose, hashedFns } from '_utils/base'
import { GAME_SIZE, MOVING_AREA_FACTOR } from '_utils/constants'
import { length, getItem } from '_utils/array'

const addGtThen = (x, y, z) => gt(add(x, y), z)

const getMaxReach = (maxAxisCoordinate, axisCoordinate, movingAxisSize) =>
  hashedFns({
    true: () => sub(maxAxisCoordinate, axisCoordinate),
    false: always(movingAxisSize),
  })(addGtThen(movingAxisSize, axisCoordinate, maxAxisCoordinate))

const getMovingAreaScale = reach => div(reach, MOVING_AREA_FACTOR)

const randomAxisCoordinateBeetwen = (axisCoordinate, min, max) =>
  randomBetween(sub(axisCoordinate, min), add(axisCoordinate, max))

const calcAxisRandomCoordinate = (gameAxisSize, axisSize, axisCoordinate, scale) =>
  compose(
    scaledSize =>
      randomAxisCoordinateBeetwen(
        axisCoordinate,
        Math.min(axisCoordinate, scaledSize),
        getMaxReach(gameAxisSize, axisCoordinate, scaledSize)
      ),
    mult(axisSize)
  )(scale)

const calcRandomDestination = (coordinate, size) => scale =>
  Coordinate(
    calcAxisRandomCoordinate(GAME_SIZE.w(), size.w(), coordinate.x(), scale),
    calcAxisRandomCoordinate(GAME_SIZE.h(), size.h(), coordinate.y(), scale)
  )

const createDestination = spaceship =>
  spaceship.getPropsAndMap('coordinate', 'reach', 'size')((coordinate, reach, size) =>
    compose(
      calcRandomDestination(coordinate, size),
      getMovingAreaScale
    )(reach)
  )

const fSetDestination = flip(setDestination)

const fSetTarget = flip(setTarget)

export const selectSpaceshipDestination = spaceship =>
  compose(
    fSetDestination(spaceship),
    createDestination
  )(spaceship)

const decrement = x => sub(x, 1)

const getRandomSpaceship = spaceships =>
  compose(
    getItem(spaceships),
    Math.round,
    randomBetween(0),
    decrement,
    length
  )(spaceships)

export const selectSpaceshipTarget = enemySpaceships => spaceship =>
  compose(
    fSetTarget(spaceship),
    createDestination,
    getRandomSpaceship
  )(enemySpaceships)
