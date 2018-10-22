import { GAME_SIZE } from '_utils/constants'
import { randomBetween } from '_utils/functions/helper'
import Coordinate from '_models/coordinate'
import { setDestination, setTarget } from '_models/spaceship/functions'
import { getPropsAndMap, either } from '../utils/functions/maybe';

const getMinX = movingAreaWidth => coordinate => {
  const maxXDistance = movingAreaWidth / 2
  if (coordinate.x() - maxXDistance < 0) return coordinate.x()
  return maxXDistance
}

const getMaxX = movingAreaWidth => coordinate => {
  const maxXDistance = movingAreaWidth / 2
  if (coordinate.x() + maxXDistance > GAME_SIZE.w()) return GAME_SIZE.w() - coordinate.x()
  return maxXDistance
}

const getMinY = movingAreaHeigth => coordinate => {
  const maxYDistance = movingAreaHeigth / 2
  if (coordinate.y() - maxYDistance < 0) return coordinate.y()
  return maxYDistance
}

const getMaxY = movingAreaHeigth => coordinate => {
  const maxYDistance = movingAreaHeigth / 2
  if (coordinate.y() + maxYDistance > GAME_SIZE.h()) return GAME_SIZE.h() - coordinate.y()
  return maxYDistance
}

const createDestination = spaceship =>
    getPropsAndMap(spaceship)((coordinate, speed, size) => {
      const scale = speed / 300
      const movingAreaWidth = size.w() * scale
      const movingAreaHeigth = size.h() * scale
      const minX = getMinX(movingAreaWidth)(coordinate)
      const maxX = getMaxX(movingAreaWidth)(coordinate)
      const minY = getMinY(movingAreaHeigth)(coordinate)
      const maxY = getMaxY(movingAreaHeigth)(coordinate)
      const x = randomBetween(coordinate.x() - minX, coordinate.x() + maxX)
      const y = randomBetween(coordinate.y() - minY, coordinate.y() + maxY)
      return Coordinate(x, y)
    })('coordinate', 'speed', 'size').flatten()

export const selectSpaceshipDestination = spaceship => {
  const destination = createDestination(spaceship)
  return setDestination(destination)(spaceship)
}

export const selectSpaceshipTarget = enemySpaceships => spaceship => {
  const enemySpaceship = enemySpaceships[Math.round(randomBetween(0, enemySpaceships.length - 1))]
  const target = createDestination(enemySpaceship)
  return setTarget(target)(spaceship)
}
