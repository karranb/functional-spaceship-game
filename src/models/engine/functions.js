import { MAX_ROUNDS } from '_utils/constants'
import {
  isUser,
  isNotUser,
  selectSpaceship as selectUserSpaceship,
  setSelectedDestination,
  setSelectedTarget,
  removeDestroyedSpaceships,
  isReady,
  getSelected,
  replaceSelected,
  update as updatePlayer,
  getSpaceships,
} from '_models/player/functions'
import {
  processSpaceshipCollisionDamage,
  processBulletCollisionDamage,
  getBullets,
  processSpaceshipCollisions,
} from '_models/spaceship/functions'
import CollisionsIndex from '_models/collisions-index'
import { compose, map, reduce, hashedFns } from '_utils/base'
import { add } from '_utils/math'
import { or, gte, lte, fEither } from '_utils/logic'
import { filter, find, length, every } from '_utils/array'
import { getProp, assignState } from '_utils/model'
import { callListenerIfExist, flip, always } from '_utils/helper'

/**
 * Get player that is controlled by user
 */
export const getUser = engine =>
  compose(
    fEither(null),
    map(find(isUser)),
    getProp('players')
  )(engine)

/**
 * get players that are not contrlled by user
 */
export const getNonUsers = engine =>
  compose(
    fEither([]),
    map(filter(isNotUser)),
    getProp('players')
  )(engine)

/**
 * Start a new round
 */

const getRoundAndIncrement = compose(
  add(1),
  fEither(0),
  getProp('round')
)

const getSpaceshipsLen = compose(
  fEither(0),
  map(length),
  getProp('spaceships')
)

const getRemanainingSpaceships = compose(
  fEither([]),
  map(
    compose(
      filter(getSpaceshipsLen),
      map(removeDestroyedSpaceships)
    )
  ),
  getProp('players')
)

const isLengthLteOne = compose(
  flip(lte)(1),
  length
)

const setNewRoundState = (round, players) => engine =>
  compose(
    newEngine =>
      hashedFns({
        true: always(callListenerIfExist('onGameEnd')(newEngine)),
        false: always(callListenerIfExist('onNewRound')(newEngine)),
      })(or(gte(round, MAX_ROUNDS), isLengthLteOne(players))),
    assignState({
      round: getRoundAndIncrement(engine),
      players: getRemanainingSpaceships(engine),
    })
  )(engine)

export const newRound = engine =>
  setNewRoundState(getRoundAndIncrement(engine), getRemanainingSpaceships(engine))(engine)

const getPlayersSpaceships = reduce((acc, player) => [...acc, ...getSpaceships(player)], [])

const removeCollided = collisions => (remaining, bullet) =>
  hashedFns({
    true: () => {
      callListenerIfExist('onDestroy')(bullet)
      return remaining
    },
    false: always([...remaining, bullet]),
  })(collisions.hasBulletCollided(bullet))

const processSpaceshipCollisionsDamage = (collisions, spaceshipIndex) => spaceship =>
  collisions
    .getSpaceshipSpaceshipsCollisions(spaceshipIndex)
    .reduce(processSpaceshipCollisionDamage, spaceship)

const processBulletCollisionsDamage = (collisions, spaceshipIndex) => spaceship =>
  collisions
    .getSpaceshipBulletsCollisions(spaceshipIndex)
    .reduce(processBulletCollisionDamage, spaceship)

const applyCollisions = players => collisions =>
  players.map(player =>
    compose(
      spaceships => player.assignState({ spaceships }),
      compose(
        map(spaceship =>
          compose(
            processBulletCollisionsDamage(collisions, spaceship),
            processSpaceshipCollisionsDamage(collisions, spaceship),
            bullets => assignState({ bullets })(spaceship),
            reduce(removeCollided(collisions), []),
            getBullets
          )(spaceship)
        ),
        getSpaceships
      )
    )(player)
  )

const processPlayersCollisions = players =>
  compose(
    applyCollisions(players),
    spaceships =>
      reduce(
        (collisionsIndex, spaceship) =>
          processSpaceshipCollisions(collisionsIndex, spaceship, spaceships),
        CollisionsIndex(),
        spaceships
      ),
    getPlayersSpaceships
  )(players)

const getUpdatedPlayers = compose(
  fEither([]),
  map(
    compose(
      processPlayersCollisions,
      map(updatePlayer)
    )
  ),
  getProp('players')
)

const arePlayersReady = every(isReady)

const setUpdateState = engine => players =>
  compose(
    newEngine =>
      hashedFns({
        true: () => newRound(newEngine),
        false: () => callListenerIfExist('onUpdate')(newEngine),
      })(arePlayersReady(players)),
    assignState({ players })
  )(engine)

export const update = engine =>
  compose(
    setUpdateState(engine),
    getUpdatedPlayers
  )(engine)

/**
 * Start to update engine
 */
export const startUpdate = engine => callListenerIfExist('onStartUpdate')(engine)

/**
 * update engine player list
 */
const updateUser = engine => user =>
  compose(
    otherPlayers => assignState({ players: [...otherPlayers, user] })(engine),
    getNonUsers
  )(engine)

/**
 * Get user selected spaceship
 */
export const getSelectedSpaceship = compose(
  getSelected,
  getUser
)

/**
 * replace user selected spaceship
 */
export const replaceSelectedSpaceship = spaceship => engine =>
  compose(
    updateUser(engine),
    flip(replaceSelected)(spaceship),
    getUser
  )(engine)

/**
 * set a target to user selected spaceship
 */
export const selectSpaceshipTarget = targetCoordinate => engine =>
  compose(
    updateUser(engine),
    setSelectedTarget(targetCoordinate),
    getUser
  )(engine)

/**
 * set a destination to the user sleected spaceship
 */
export const selectSpaceshipDestination = destination => engine =>
  compose(
    updateUser(engine),
    setSelectedDestination(destination),
    getUser
  )(engine)

const callSelectSpaceshipListner = spaceship => engine =>
  compose(
    always(engine),
    map(fn => fn(spaceship)(engine)),
    getProp('onSelectSpaceship')
  )(engine)

/**
 * set a user spaceship as selected
 */
export const selectSpaceship = spaceship => engine =>
  compose(
    callSelectSpaceshipListner(spaceship),
    updateUser(engine),
    selectUserSpaceship(spaceship),
    getUser
  )(engine)
