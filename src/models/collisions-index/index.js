import {
  setBulletCollisionIndex,
  hasBulletCollided,
  getSpaceshipBulletsCollisions,
  getSpaceshipSpaceshipsCollisions,
  setSpaceshipsCollisionsIndexes,
  setSpaceshipBulletCollision,
  getSpaceshipsCollisionIndex,
} from './functions'

const CollisionsIndex = (collisionsIndex = new Map()) => ({
  setBulletCollisionIndex: setBulletCollisionIndex(collisionsIndex, CollisionsIndex),
  hasBulletCollided: hasBulletCollided(collisionsIndex),
  getSpaceshipSpaceshipsCollisions: getSpaceshipSpaceshipsCollisions(collisionsIndex),
  getSpaceshipBulletsCollisions: getSpaceshipBulletsCollisions(collisionsIndex),
  setSpaceshipsCollisionsIndexes: setSpaceshipsCollisionsIndexes(collisionsIndex, CollisionsIndex),
  setSpaceshipBulletCollision: setSpaceshipBulletCollision(collisionsIndex, CollisionsIndex),
  getSpaceshipCollisionIndex: getSpaceshipsCollisionIndex(collisionsIndex),
})

export default CollisionsIndex
