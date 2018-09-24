import Coordinate from '_models/coordinate'
import { checkCollisionSquareCircle } from '_utils/functions/spatial'

import Bullet from './index'

const setPosition = coordinate => bullet => {
  const state = bullet.getState()
  const newBullet = Bullet({ ...state, coordinate })
  if (state.onMove) {
    state.onMove(newBullet)
  }
  return newBullet
}

export const update = bullet => {
  const state = bullet.getState()
  const { coordinate, velX, velY } = state

  const x = coordinate.x() - velX
  const y = coordinate.y() - velY

  return setPosition(Coordinate(x, y))(bullet)
}

export const checkCollisions = spaceships => bullet => {
  const curriedCheckCollision = spaceship => checkCollisionSquareCircle(spaceship)(bullet)
  return spaceships.some(curriedCheckCollision) && bullet.getState().onDestroy(bullet)
}
