import { MAX_ROUNDS } from '_utils/constants'
import {
  isUser,
  isNotUser,
  selectSpaceship as selectUserSpaceship,
  setSelectedDestination,
  setSelectedTarget,
  processCollisions,
  removeDestroyedSpaceships,
  isReady,
  getSelected,
  replaceSelected,
  update as updatePlayer,
} from '_models/player/functions'
import { compose } from '_utils/functions/base'

import Engine from './index'
import { either } from '../../utils/functions/maybe';

/**
 * Get player that is controlled by user
 */
export const getUser = engine => either(engine.getProp('players').map(players => players.find(isUser)), null)

/**
 * get players that are not contrlled by user
 */
export const getNonUsers = engine => either(engine.getProp('players').map(players => players.filter(isNotUser)), null)

/**
 * Start a new round
 */
export const newRound = engine => {
  const round = either(engine.getProp('round').map(round => round + 1), 0)

  const players = either(engine.getProp('players').map(players => players.map(removeDestroyedSpaceships)
  .filter(player => either(player.getProp('spaceships').map(spaceships => spaceships.length), 0))
  ), [])

  const newEngine = engine.assignState({ round, players })

  if (round >= MAX_ROUNDS || players.length <= 1) {
    engine.getProp('onGameEnd').apply(newEngine)
    return newEngine
  }
  engine.getProp('onNewRound').apply(newEngine)
  return newEngine
}

/**
 * Update engine's state
 */
export const update = engine => {
  const players = either(engine.getProp('players').map(
    players => players
      .map(updatePlayer)
      .map((player, _, allPlayers) => processCollisions(player)(allPlayers))
  ), [])

  const isPlayerReady = player => isReady(player)

  const allReady = players.every(isPlayerReady)

  const newEngine = engine.assignState({ players })

    
  if (allReady) {
    return newRound(newEngine)
  }
  engine.getProp('onUpdate').apply(newEngine)
  return newEngine
}

/**
 * Start to update engine
 */
export const startUpdate = engine => engine.getProp('onStartUpdate').apply(engine)

/**
 * update engine player list
 */
const updateUser = engine => user => {
  const otherPlayers = getNonUsers(engine)
  return engine.assignState({ players: [ ...otherPlayers, user ] })
}

/**
 * Get user selected spaceship
 */
export const getSelectedSpaceship = engine =>
  compose(
    getSelected,
    getUser
  )(engine)

/**
 * replace user selected spaceship
 */
export const replaceSelectedSpaceship = spaceship => engine =>
  compose(
    updateUser(engine),
    replaceSelected(spaceship),
    getUser
  )(engine)

/**
 * set a target to user selected spaceship
 */
export const selectSpaceshipTarget = targetCoordinate => engine =>
  compose(
    newEngine => either(newEngine.getProp('onSetTarget').apply(newEngine), newEngine),
    updateUser(engine),
    setSelectedTarget(targetCoordinate),
    getUser
  )(engine)

/**
 * set a destination to the user sleected spaceship
 */
export const selectSpaceshipDestination = destination => engine =>
  compose(
    newEngine =>  either(newEngine.getProp('onSetDestination').apply(newEngine), newEngine),
    updateUser(engine),
    setSelectedDestination(destination),
    getUser
  )(engine)


/**
 * set a user spaceship as selected
 */
export const selectSpaceship = spaceship => engine =>
  compose(
    newEngine => either(newEngine.getProp('onSelectSpaceship').apply(spaceship, newEngine), newEngine),
    updateUser(engine),
    selectUserSpaceship(spaceship),
    getUser
  )(engine)
