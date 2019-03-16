import {
  checkOutBounds,
  checkCollisionSquareCircle,
  checkCollisionBetweenPolygons,
  areEqualCoordinates,
  move,
} from '_utils/functions/spatial'
import {
  update as updateBullet,
  checkCollisions as checkBulletCollisions,
} from '_models/bullet/functions'
import { SPACESHIP_COLLISION_DAMAGE } from '_utils/constants'
import Bullet from '_models/bullet'

import Spaceship from './index'
import { mapMaybes, isNothing, Maybe, either, getPropsAndMap } from '_utils/functions/maybe';
import { compose, map } from '_utils/functions/base';


const mapMaybe = fn => maybe => map(maybe, fn) 
const assignState = state => element => element.assignState(state)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp ? element.getProp(prop) : Maybe(element[prop])
const apply = (...args) => maybeFn => maybeFn.apply(...args)
const flatten = maybe => maybe.flatten()

const cEither = other => maybe => either(maybe, other)
const always = x => () => x

const getListenerAndApply = listenerName => model =>
  compose(
    cEither(model),
    apply(model),
    getProp(listenerName)
  )(model)


const assertIsNotNothing = message => value => {
  if (Maybe(value).isNothing()) {
      throw message
  }
  return value
}


/**
 * rotate spaceship
 */
export const rotate = rotation => spaceship =>
  compose(
    getListenerAndApply('onRotate'),
    assignState({ rotation })
  )(spaceship)

const getDestination = spaceship =>
  compose(
    flatten,
    getProp('destination')
  )(spaceship)

const noDestinationOrStopped = spaceship => coordinate =>
  compose(
    destination => destination === null,//  || areEqualCoordinates(destination, coordinate),
    getDestination  
  )(spaceship)


/**
 * Return true if the spaceship is still
 */
export const isStill = spaceship =>
  compose(
    flatten,
    mapMaybe(noDestinationOrStopped(spaceship)),
    assertIsNotNothing('No Coordinate'),
    getProp('coordinate')
  )(spaceship)


/**
 * return true if the spaceship and its bullets are still and destroyed  
 */
export const isReady = spaceship =>
  compose(
    bullets => (isDestroyed(spaceship) || isStill(spaceship)) && !bullets.length,
    cEither([]),
    getProp('bullets')
  )(spaceship)

/**
 * Destroy the spaceship and call on destroy listener
 */


export const destroy = spaceship => 
  compose(
    getListenerAndApply('onDestroy'),
    assignState({ isDestroyed: true })
  )(spaceship)


/**
 * reduce the spaceship shield
 */
export const reduceShield = damage => spaceship => {
  const destroyOrReduce = shield =>
    shield > 0 ? spaceship.assignState({ shield: shield - damage }) : destroy(spaceship)
  return compose(
    flatten,
    mapMaybe(destroyOrReduce),
    assertIsNotNothing('No Shield'),
    getProp('shield')
  )(spaceship)
}
  

/**
 * return true if the spaceship is destroyed
 */
export const isDestroyed = spaceship => compose(
  cEither(false),
  getProp('isDestroyed')
)(spaceship)


/**
 * return true if the spaceship is not destroyed
 */
export const isAlive = spaceship => !isDestroyed(spaceship)

/**
 * set a target to a spaceship
 */
export const setTarget = target => spaceship =>
  compose(
    bullet => spaceship.assignState({
      bullets: [bullet],
      targetCoordinate: target,
    }),
    flatten,
    mapMaybe(coordinate => Bullet({
      coordinate,
      destination: target,
      power: 300,
    })),
    assertIsNotNothing('No Coordinate'),
    getProp('coordinate'),
  )(spaceship)


/**
 * Set a coordinate to a spaceship
 */
export const setCoordinate = coordinate => spaceship =>
  compose(
    getListenerAndApply('onSetCoordinate'),
    assignState({ coordinate })
  )(spaceship)


/**
 * Set a destination to a spaceship
 */
export const setDestination = destination => spaceship =>
  compose(
    cEither('spaceship'),
    mapMaybe(coordinate => {
      const tx = destination.x() - coordinate.x()
      const ty = destination.y() - coordinate.y()
      return compose(
        rotate(Math.atan2(ty, tx)),
        assignState({ destination })
      )(spaceship)
    }),
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
export const isSelected = spaceship => compose(
  cEither(false),
  getProp('isSelected')
)(spaceship)


/**
 * return true if the spaceship is not selected by the user
 */
export const isNotSelected = spaceship => !isSelected(spaceship)


const updateBullets = spaceship => compose(
  cEither(spaceship),
  mapMaybe(bullets => spaceship.assignState({ bullets })),
  mapMaybe(bullets => bullets.map(updateBullet)),
  getProp('bullets')
)(spaceship)

const vel = 2


// daskdjaslkdjldajdlaksjkldasds
const getNewPositionAndMove = spaceship => (coordinate, destination) =>
  compose(
    updatedSpaceship => areEqualCoordinates(coordinate, destination) ? getListenerAndApply('onStop')(updatedSpaceship.assignState({ destination: null })) : updatedSpaceship,
    newPosition => setCoordinate(newPosition)(spaceship),
    () => move(coordinate, destination)(vel)
  )()

const updateSpaceshipCoordinate = spaceship =>
  compose(
    updatedSpaceship => !isNothing(updatedSpaceship) ? updatedSpaceship : spaceship,
    currentSpaceship => currentSpaceship.getPropsAndMap('coordinate', 'destination')(getNewPositionAndMove(currentSpaceship)),
  )(spaceship)

  /**
 * update the spaceship and its bullets state
 */
export const update = spaceship => compose(
  updatedSpaceship => Maybe(updatedSpaceship).flatten(),
  updateSpaceshipCoordinate,
  updateBullets
)(spaceship)

/**
 * process collisions between spaceships
 */
const processCollisionWithSpaceship = spaceship => otherSpaceship => {
  if (
    isAlive(spaceship) &&
    isAlive(otherSpaceship) &&
    checkCollisionBetweenPolygons(spaceship, otherSpaceship)
  ) {
    if (isStill(spaceship) && isStill(otherSpaceship)) {
      return destroy(spaceship)
    }
    return reduceShield(SPACESHIP_COLLISION_DAMAGE)(spaceship)
  }
  return spaceship
}

/**
 * process spaceship between bullet and spaceship
 */
const processCollisionsWithBullets = (spaceship, bullet) =>
  isAlive(spaceship) && checkCollisionSquareCircle(spaceship)(bullet)
    ? either(bullet.getProp('power').map(power => reduceShield(power)(spaceship)).flatten(), spaceship)
    : spaceship

/**
 * process collisions between spaceship with other's spaceships and bullets
 */
export const processCollisions = otherSpaceships => spaceship => {
  const otherAliveSpaceships = otherSpaceships.filter(isAlive)
  const isOnTrack = bullet =>
    !checkBulletCollisions(otherAliveSpaceships)(bullet) && !checkOutBounds(bullet)
  const oldBullets = either(spaceship.getProp('bullets'), [])
  const bullets = oldBullets.filter(isOnTrack)

  const processSpaceshipCollisions = (unprocessedSpaceship, otherSpaceship) => {
    const processedSpaceship = otherSpaceship.getProp('bullets').map(
      bullets => bullets.reduce(processCollisionsWithBullets, unprocessedSpaceship)
    ).flatten()
    return processCollisionWithSpaceship(processedSpaceship)(otherSpaceship)
  }

  const spaceshipWithProcessedBullets = spaceship.assignState({ bullets })
  return otherSpaceships.reduce(processSpaceshipCollisions, spaceshipWithProcessedBullets)
}
