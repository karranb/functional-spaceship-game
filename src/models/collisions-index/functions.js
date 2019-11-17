import { hashedFns, curry, compose } from '_utils/base'

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
  compose(index =>
    index
      ? Array.from(index.spaceships.keys()).filter(x =>
          collisionsIndex.get(spaceship).spaceships.get(x)
        )
      : []
  )(collisionsIndex.get(spaceship))
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

export const setBulletCollisionIndex = (collisionsIndex, constructor) => bullet => {
  collisionsIndex.set(bullet, true)
  return constructor(collisionsIndex)
}
export const hasBulletCollided = collisionsIndex => bullet => collisionsIndex.has(bullet)
export const getSpaceshipSpaceshipsCollisions = collisionsIndex =>
  getSpaceshipCollisions(collisionsIndex)
export const getSpaceshipBulletsCollisions = collisionsIndex => spaceship =>
  collisionsIndex.get(spaceship) ? Array.from(collisionsIndex.get(spaceship).bullets.keys()) : []
export const setSpaceshipsCollisionsIndexes = (collisionsIndex, constructor) => (
  spaceship,
  otherSpaceship,
  hasCollision
) => {
  setSpaceshipSpaceshipIndexHit(collisionsIndex, spaceship, otherSpaceship, hasCollision)
  setSpaceshipSpaceshipIndexHit(collisionsIndex, otherSpaceship, spaceship, hasCollision)
  return constructor(collisionsIndex)
}

export const setSpaceshipBulletCollision = (collisionsIndex, constructor) => (
  spaceship,
  bullet
) => {
  setSpaceshipBulletIndexHit(collisionsIndex, spaceship, bullet)
  collisionsIndex.set(bullet, true)
  return constructor(collisionsIndex)
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
