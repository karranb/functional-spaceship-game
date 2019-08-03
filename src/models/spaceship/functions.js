import {
  checkOutBounds,
  areEqualCoordinates,
  getAngle,
  getVelFactors,
  processMove,
} from '_utils/spatial'
import {
  checkCollisionSquareCircleWrapper,
  checkCollisionBetweenPolygonsWrapper,
} from '_utils/collision'
import { update as updateBullet } from '_models/bullet/functions'
import { SPACESHIP_COLLISION_DAMAGE, SPACESHIP_SPEED, BULLET_POWER } from '_utils/constants'
import Bullet from '_models/bullet'
import Maybe from '_utils/maybe'
import { isNothing, flatten } from '_utils/maybe/functions'
import { compose, map, hashedFns } from '_utils/base'
import { assignState, getProp } from '_utils/model'
import { gt, not, and, or, eq, fEither, diff } from '_utils/logic'
import { sub } from '_utils/math'
import { length, forEach } from '_utils/array'
import { callListenerIfExist, assertIsNotNothing, flip, empty, always } from '_utils/helper'

/**
 * rotate spaceship
 */
export const rotate = rotation => spaceship =>
  compose(
    callListenerIfExist('onRotate'),
    assignState({ rotation })
  )(spaceship)

const getDestination = spaceship =>
  compose(
    flatten,
    getProp('destination')
  )(spaceship)

/**
 * return true if the spaceship is destroyed
 */
export const isDestroyed = spaceship =>
  compose(
    fEither(false),
    getProp('isDestroyed')
  )(spaceship)

/**
 * Return true if the spaceship is still
 */
export const isStill = spaceship =>
  compose(
    eq(null),
    getDestination
  )(spaceship)

const isDestroyedOrStill = spaceship => or(isStill(spaceship), isDestroyed(spaceship))

const hasNoItems = compose(
  not,
  length
)

/**
 * return true if the spaceship and its bullets are still and destroyed
 */
export const isReady = spaceship =>
  compose(
    and(isDestroyedOrStill(spaceship)),
    hasNoItems,
    fEither([]),
    getProp('bullets')
  )(spaceship)

/**
 * Destroy the spaceship and call on destroy listener
 */

export const destroy = spaceship =>
  compose(
    callListenerIfExist('onDestroy'),
    assignState({ isDestroyed: true })
  )(spaceship)

/**
 * reduce the spaceship shield
 */
const destroyOrReduce = damage => spaceship => shield =>
  hashedFns({
    true: () => spaceship.assignState({ shield: sub(shield)(damage) }),
    false: () => destroy(spaceship),
  })(gt(shield, damage))

export const reduceShield = spaceship => damage =>
  compose(
    flatten,
    map(destroyOrReduce(damage)(spaceship)),
    assertIsNotNothing('No Shield'),
    getProp('shield')
  )(spaceship)

/**
 * return true if the spaceship is not destroyed
 */
export const isAlive = spaceship => not(isDestroyed(spaceship))

/**
 * set a target to a spaceship
 */
export const setTarget = target => spaceship =>
  compose(
    bullet =>
      spaceship.assignState({
        bullets: [bullet],
        targetCoordinate: target,
      }),
    flatten,
    map(coordinate =>
      Bullet({
        coordinate,
        destination: target,
        power: BULLET_POWER,
      })
    ),
    assertIsNotNothing('No Coordinate'),
    getProp('coordinate')
  )(spaceship)

/**
 * Set a coordinate to a spaceship
 */
export const setCoordinate = coordinate => spaceship =>
  compose(
    callListenerIfExist('onSetCoordinate'),
    assignState({ coordinate })
  )(spaceship)

/**
 * Set a destination to a spaceship
 */
export const setDestination = destination => spaceship =>
  compose(
    fEither('spaceship'),
    map(coordinate =>
      compose(
        assignState({ velFactors: getVelFactors(coordinate, destination) }),
        rotate(getAngle(destination, coordinate)),
        assignState({ destination })
      )(spaceship)
    ),
    assertIsNotNothing('No Coordinate'),
    getProp('coordinate')
  )(spaceship)

/**
 * mark a spaceship as selected by an user
 */
export const select = spaceship => spaceship.assignState({ isSelected: true })

/**
 * mark a spaceship as not selected by an user
 */
export const disselect = spaceship => spaceship.assignState({ isSelected: false })

/**
 * return true if the spaceship is selected by the user
 */
export const isSelected = spaceship =>
  compose(
    fEither(false),
    getProp('isSelected')
  )(spaceship)

/**
 * return true if the spaceship is not selected by the user
 */
export const isNotSelected = spaceship => !isSelected(spaceship)

export const getBullets = compose(
  fEither([]),
  getProp('bullets')
)

const updateBullets = spaceship =>
  compose(
    fEither(spaceship),
    map(bullets => spaceship.assignState({ bullets })),
    map(map(updateBullet)),
    getProp('bullets')
  )(spaceship)

const checkStopped = (coordinate, destination) => spaceship =>
  hashedFns({
    true: () => callListenerIfExist('onStop')(spaceship.assignState({ destination: null })),
    false: () => spaceship,
  })(areEqualCoordinates(coordinate, destination))

const getNewPositionAndMove = spaceship => (coordinate, destination) =>
  compose(
    checkStopped(coordinate, destination),
    flip(setCoordinate)(spaceship),
    () => processMove(coordinate, destination, spaceship.getState().velFactors, SPACESHIP_SPEED)
  )()

const isSomething = compose(
  not,
  isNothing
)

const updateSpaceshipCoordinate = spaceship =>
  compose(
    updatedSpaceship =>
      hashedFns({ true: () => updatedSpaceship, false: () => spaceship })(
        isSomething(updatedSpaceship)
      ),
    currentSpaceship =>
      currentSpaceship.getPropsAndMap('coordinate', 'destination')(
        getNewPositionAndMove(currentSpaceship)
      )
  )(spaceship)

/**
 * update the spaceship and its bullets state
 */
export const update = spaceship =>
  compose(
    flatten,
    Maybe,
    newSpaceship =>
      hashedFns({
        true: () => updateSpaceshipCoordinate(newSpaceship),
        false: () => newSpaceship,
      })(isAlive(newSpaceship)),
    updateBullets
  )(spaceship)

const areStill = (spaceship, otherSpaceship) =>
  compose(
    and(isStill(spaceship)),
    isStill
  )(otherSpaceship)

export const processSpaceshipCollisionDamage = (spaceship, otherSpaceship) =>
  hashedFns({
    true: () => reduceShield(spaceship)(2000),
    false: () => reduceShield(spaceship)(SPACESHIP_COLLISION_DAMAGE),
  })(areStill(spaceship, otherSpaceship))

const isAliveAndHitten = (spaceship, bullet) =>
  compose(
    and(isAlive(spaceship)),
    always(true)
  )(bullet)

const getPowerAndReduceShield = (spaceship, bullet) =>
  compose(
    fEither(spaceship),
    map(reduceShield(spaceship)),
    getProp('power')
  )(bullet)

export const processBulletCollisionDamage = (spaceship, bullet) =>
  hashedFns({
    true: () => getPowerAndReduceShield(spaceship, bullet),
    false: () => spaceship,
  })(isAliveAndHitten(spaceship, bullet))

const getOtherSpaceships = (spaceship, spaceships) => spaceships.filter(x => diff(x)(spaceship))

const checkCollisionBetweenSpaceships = (collisionsIndex, spaceship, otherSpaceship, engine) =>
  engine.getProp('checkCollisionBetweenPolygons').map(fn => {
    const collisionIndex = collisionsIndex.getSpaceshipCollisionIndex(spaceship, otherSpaceship)
    if (collisionIndex !== undefined) return collisionIndex
    const hasCollision = not(isAlive(spaceship))
      ? false
      : checkCollisionBetweenPolygonsWrapper(spaceship, otherSpaceship, fn)
    return collisionsIndex.setSpaceshipsCollisionsIndexes(spaceship, otherSpaceship, hasCollision)
  })

const checkBulletsCollision = (collisions, spaceship, bullets, engine) =>
  engine.getProp('checkCollisionSquareCircle').map(fn =>
    forEach(bullet => {
      hashedFns({
        true: () => collisions.setSpaceshipBulletCollision(spaceship, bullet),
        false: empty,
      })(and(isAlive(spaceship), checkCollisionSquareCircleWrapper(spaceship, bullet, fn)))
    })(bullets)
  )

const setOutBoundCollisions = collisionsIndex =>
  forEach(bullet =>
    hashedFns({
      true: () => collisionsIndex.setBulletCollisionIndex(bullet),
      false: empty,
    })(checkOutBounds(bullet))
  )

export const processSpaceshipCollisions = (collisionsIndex, spaceship, spaceshipsList, engine) => {
  const bullets = getBullets(spaceship)
  setOutBoundCollisions(collisionsIndex)(bullets)
  const otherSpaceships = getOtherSpaceships(spaceship, spaceshipsList).filter(isAlive)
  forEach(otherSpaceship => {
    checkBulletsCollision(collisionsIndex, otherSpaceship, bullets, engine)
    checkCollisionBetweenSpaceships(collisionsIndex, spaceship, otherSpaceship, engine)
  })(otherSpaceships)
  return collisionsIndex
}
