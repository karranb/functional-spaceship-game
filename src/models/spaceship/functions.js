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
import { mapMaybes, isNothing } from '_utils/functions/maybe';
import { compose } from '_utils/functions/base';
import { either, getPropsAndMap } from '../../utils/functions/maybe';

/**
 * rotate spaceship
 */
export const rotate = rad => spaceship => {
  const rotatedSpaceship = spaceship.assignState({ rotation: rad })
  return either(
    rotatedSpaceship.getProp('onRotate').apply(rotatedSpaceship),
    rotatedSpaceship
  )
}

/**
 * Return true if the spaceship is still
 */
export const isStill = spaceship =>
    getPropsAndMap(spaceship)(areEqualCoordinates)('coordinate', 'destination').flatten()


/**
 * return true if the spaceship and its bullets are still and destroyed  
 */
export const isReady = spaceship =>
  getPropsAndMap(spaceship)(
    (destroyed, bullets) => 
      (destroyed || isStill(spaceship)) && ! bullets.length
    )('isDestroyed', 'bullets').flatten()

/**
 * Destroy the spaceship and call on destroy listener
 */
export const destroy = spaceship => {
  const destroyedSpaceship = spaceship.assignState({ isDestroyed: true })
  return either(
    destroyedSpaceship.getProp('onDestroy').apply(destroyedSpaceship).flatten(),
    destroyedSpaceship
  )
}

/**
 * reduce the spaceship shield
 */
export const reduceShield = damage => spaceship =>
  spaceship.getProp.map(
    shield => {
      if (shield < 0) {
        return destroy(spaceship)
      }
      return spaceship.assignState({
        shield: shield - damage
      })
    }
  ).flatten()

/**
 * return true if the spaceship is destroyed
 */
export const isDestroyed = spaceship => spaceship.getProp('isDestroyed').flatten()

/**
 * return true if the spaceship is not destroyed
 */
export const isAlive = spaceship => !isDestroyed(spaceship)

/**
 * set a target to a spaceship
 */
export const setTarget = target => spaceship =>
  spaceship.getProp('coordinate').map(
    coordinate => {
      const bullet = Bullet({
        coordinate,
        destination: target,
        power: 300,
      })
      const bullets = [bullet]
      return spaceship.assignState({
        bullets,
        targetCoordinate: target,
      })
    }
  ).flatten()

/**
 * Set a coordinate to a spaceship
 */
export const setCoordinate = coordinate => spaceship => {
  const positionatedSpaceship = spaceship.assignState({
    coordinate,
  })
  return either(
    positionatedSpaceship.getProp('onSetCoordinate').apply(positionatedSpaceship),
    positionatedSpaceship
  )
}

/**
 * Set a destination to a spaceship
 */
export const setDestination = destination => spaceship =>
  either(
    spaceship.getProp('coordinate').map(
      coordinate => {
        const tx = destination.x() - coordinate.x()
        const ty = destination.y() - coordinate.y()
        return rotate(Math.atan2(ty, tx))(
          spaceship.assignState({ destination })
        )
      }
    ).flatten(),
    spaceship
  )

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
export const isSelected = spaceship => either(
  spaceship.getProp('isSelected').flatten(),
  false
)

/**
 * return true if the spaceship is not selected by the user
 */
export const isNotSelected = spaceship => !isSelected(spaceship)


/**
 * update the spaceship and its bullets state
 */
export const update = spaceship =>
  either(
    getPropsAndMap(spaceship)(
      (bulletsProp, destination, coordinate) => {
        const bullets = bulletsProp.map(updateBullet)
        const vel = 2
        const newPosition = move(coordinate, destination)(vel)
        const movedSpaceship = setCoordinate(newPosition)(spaceship.assignState({ bullets }))
        if (areEqualCoordinates(coordinate, destination)) {
          const stoppedSpaceship = spaceship.assignState({ destination: null })
          return either(
            stoppedSpaceship.getProp('onStop').apply(stoppedSpaceship).flatten(),
            stoppedSpaceship
          )
        }
        return movedSpaceship
      }
    )('bullets', 'destination', 'coordinate').flatten(),
    spaceship
  )

/**
 * process collisions between spaceships
 */
const processCollisionWithSpaceship = spaceship => otherSpaceship => {
  if (
    isAlive(spaceship) &&
    isAlive(otherSpaceship) &&
    checkCollisionBetweenPolygons(spaceship, otherSpaceship)
  ) {
    if (isStill(spaceship)) {
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
