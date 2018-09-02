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
  setBulletCollisionIndex: setBulletCollisionIndex(collisionsIndex),
  hasBulletCollided: hasBulletCollided(collisionsIndex),
  getSpaceshipSpaceshipsCollisions: getSpaceshipSpaceshipsCollisions(collisionsIndex),
  getSpaceshipBulletsCollisions: getSpaceshipBulletsCollisions(collisionsIndex),
  setSpaceshipsCollisionsIndexes: setSpaceshipsCollisionsIndexes(collisionsIndex),
  setSpaceshipBulletCollision: setSpaceshipBulletCollision(collisionsIndex),
  getSpaceshipCollisionIndex: getSpaceshipsCollisionIndex(collisionsIndex),
})

export default CollisionsIndex
