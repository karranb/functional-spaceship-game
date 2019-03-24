import Coordinate from '_models/coordinate'
import { checkCollisionSquareCircle } from '_utils/functions/spatial'
import { mapMaybes, either } from '_utils/functions/maybe'
import { compose, map } from '_utils/functions/base'
import { reduce } from '../../utils/functions/base';

const cMap = fn => arg => map(arg, fn)
const getProp = prop => element => element.getProp(prop)
const cEither = other => maybe => either(maybe, other)
const assignState = state => element => element.assignState(state)
const always = x => () => x
const useWith = (useFunc, withFuncs) => (...args) => useFunc(...cMap((withFunc, i) => withFunc(args[i]))(withFuncs))
const getPropsAndMap = element => (...args) => fn => element.getPropsAndMap(...args)(fn)
/**
 * Set a position to the bullet
 */

const callListenerIfExist = listenerName => (...args) => model => 
  compose(
    cEither(model),
    cMap(fn => fn(...args)),
    getProp(listenerName)
  )(model)

const setPosition = coordinate => bullet =>
  compose(
    newBullet => callListenerIfExist('onMove')(newBullet)(newBullet),
    assignState({ coordinate })
  )(bullet)

/**
 * Calc the bullet new position and set it
 */

const setCoordinateToBullet = bullet => (x, y) => compose(
  setCoordinate => setCoordinate(bullet),
  setPosition,
  always(Coordinate(x, y)),
)()


const cCalcAndSetPosition = bullet => coordinate => useWith(
  setCoordinateToBullet(bullet),
  [
    velX => coordinate.x() + velX,
    velY => coordinate.y() + velY,
  ]
)

const calcAndSetPosition = bullet => (coordinate, velX, velY) => cCalcAndSetPosition(bullet)(coordinate)(velX, velY)

/**
 * Update the bullet state
 */

export const update = bullet => compose(
  cEither(bullet),
  getPropsAndMap(bullet)('coordinate', 'velX', 'velY'),
  calcAndSetPosition
)(bullet)

// export const update = bullet => either(
//   bullet.getPropsAndMap('coordinate', 'velX', 'velY')(calcAndSetPosition(bullet)),
//   bullet
// )

// getPropsAndMap(bullet)('coordinate', 'velX', 'velY')(calcAndSetPosition)

/**
 * Check bullet collisions
 */

const flippedCheckCollision =  circle => square =>  checkCollisionSquareCircle(square)(circle)

export const checkCollisions = spaceships => bullet => spaceships.some(flippedCheckCollision(bullet)) && callListenerIfExist('onDestroy')(bullet)(bullet)



// export const checkCollisions = spaceships => bullet => {
//   const curriedCheckCollision = spaceship => checkCollisionSquareCircle(spaceship)(bullet)
//   return spaceships.some(curriedCheckCollision) && bullet.getProp('onDestroy').apply(bullet).flatten()
// }
