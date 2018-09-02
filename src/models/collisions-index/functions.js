import { hashedFns, curry, compose } from '_utils/base'

import CollisionsIndex from './index'

const getOrCreateSpaceshipCollisionIndex = curry((collisionsIndex, spaceship) =>
  hashedFns({
    true: () => collisionsIndex.get(spaceship),
    false: () =>
      collisionsIndex
        .set(spaceship, {
          spaceships: new Map(),
          bullets: new Map(),
        })
        .get(spaceship),
  })(collisionsIndex.has(spaceship))
)

const getSpaceshipCollisions = curry((collisionsIndex, spaceship) =>
  Array.from(collisionsIndex.get(spaceship).spaceships.keys()).filter(x =>
    collisionsIndex.get(spaceship).spaceships.get(x)
  )
)

const getSpaceshipCollisionIndex = curry((collisionsIndex, spaceship, otherSpaceship) =>
  compose(
    spaceshipCollisions => spaceshipCollisions.spaceships.get(otherSpaceship),
    getOrCreateSpaceshipCollisionIndex(collisionsIndex)
  )(spaceship)
)

const setSpaceshipSpaceshipIndexHit = curry(
  (collisionsIndex, spaceship, otherSpaceship, hasCollision) =>
    getOrCreateSpaceshipCollisionIndex(collisionsIndex, spaceship).spaceships.set(
      otherSpaceship,
      hasCollision
    )
)

const setSpaceshipBulletIndexHit = curry((collisionsIndex, spaceship, bullet) =>
  getOrCreateSpaceshipCollisionIndex(collisionsIndex, spaceship).bullets.set(bullet, true)
)

export const setBulletCollisionIndex = collisionsIndex => bullet => {
  collisionsIndex.set(bullet, true)
  return CollisionsIndex(collisionsIndex)
}
export const hasBulletCollided = collisionsIndex => bullet => collisionsIndex.has(bullet)
export const getSpaceshipSpaceshipsCollisions = collisionsIndex =>
  getSpaceshipCollisions(collisionsIndex)
export const getSpaceshipBulletsCollisions = collisionsIndex => spaceship =>
  Array.from(collisionsIndex.get(spaceship).bullets.keys())
export const setSpaceshipsCollisionsIndexes = collisionsIndex => (
  spaceship,
  otherSpaceship,
  hasCollision
) => {
  setSpaceshipSpaceshipIndexHit(collisionsIndex, spaceship, otherSpaceship, hasCollision)
  setSpaceshipSpaceshipIndexHit(collisionsIndex, otherSpaceship, spaceship, hasCollision)
  return CollisionsIndex(collisionsIndex)
}

export const setSpaceshipBulletCollision = collisionsIndex => (spaceship, bullet) => {
  setSpaceshipBulletIndexHit(collisionsIndex, spaceship, bullet)
  collisionsIndex.set(bullet, true)
  return CollisionsIndex(collisionsIndex)
}

export const getSpaceshipsCollisionIndex = collisionsIndex => (spaceship, otherSpaceship) => {
  const otherSpaceshipCollisionIndex = getSpaceshipCollisionIndex(
    collisionsIndex,
    otherSpaceship,
    spaceship
  )
  return otherSpaceshipCollisionIndex !== undefined
    ? otherSpaceshipCollisionIndex
    : getSpaceshipCollisionIndex(collisionsIndex, otherSpaceship, spaceship)
}
