import Coordinate from '_models/coordinate'
import { checkCollisionSquareCircle } from '_utils/functions/spatial'
import { mapMaybes, either } from '_utils/functions/maybe'

/**
 * Set a position to the bullet
 */
const setPosition = coordinate => bullet => {
  const newBullet = bullet.assignState({ coordinate })
  return either(
    newBullet.getProp('onMove').apply(newBullet).flatten(),
    newBullet
  )
}

/**
 * Calc the bullet new position and set it
 */
const calcAndSetPosition = bullet => (coordinate, velX, velY) => {
  const x = coordinate.x() - velX
  const y = coordinate.y() - velY
  return setPosition(Coordinate(x, y))(bullet)
}

/**
 * Update the bullet state
 */
export const update = bullet =>
  either(
    getPropsAndMap(bullet)(calcAndSetPosition(bullet))('coordinate', 'velX', 'velY').flatten(),
    bullet
  )

/**
 * Check bullet collisions
 */
export const checkCollisions = spaceships => bullet => {
  const curriedCheckCollision = spaceship => checkCollisionSquareCircle(spaceship)(bullet)
  return spaceships.some(curriedCheckCollision) && bullet.getProp('onDestroy').apply(bullet).flatten()
}
