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

export const getUser = engine => engine.getState().players.find(isUser)
export const getNonUsers = engine => engine.getState().players.filter(isNotUser)

export const newRound = engine => {
  const state = engine.getState()
  const round = state.round + 1
  const players = state.players
    .map(removeDestroyedSpaceships)
    .filter(player => player.getState().spaceships.length)
  const newEngine = Engine({
    ...state,
    round,
    players,
  })
  if (round >= MAX_ROUNDS || players.length <= 1) {
    state.onGameEnd(newEngine)
  }
  if (state.onNewRound) {
    state.onNewRound(newEngine)
  }
  return newEngine
}

export const update = engine => {
  const state = engine.getState()
  const players = state.players
    .map(updatePlayer)
    .map((player, _, allPlayers) => processCollisions(player)(allPlayers))
  const isPlayerReady = player => isReady(player)
  const allReady = players.every(isPlayerReady)
  const newEngine = Engine({
    ...state,
    players,
  })

  if (allReady) {
    return newRound(newEngine)
  }
  state.onUpdate(newEngine)
  return newEngine
}

export const startUpdate = engine => {
  const state = engine.getState()
  return state.onStartUpdate(engine)
}

const updatedPlayerList = engine => user => {
  const state = engine.getState()
  const otherPlayers = getNonUsers(engine)
  return Engine({
    ...state,
    players: [...otherPlayers, user],
  })
}

export const getSelectedSpaceship = engine =>
  compose(
    getSelected,
    getUser
  )(engine)

export const replaceSelectedSpaceship = spaceship => engine =>
  compose(
    updatedPlayerList(engine),
    replaceSelected(spaceship),
    getUser
  )(engine)

export const selectSpaceshipTarget = targetCoordinate => engine => {
  const state = engine.getState()
  return compose(
    state.onSetTarget,
    updatedPlayerList(engine),
    setSelectedTarget(targetCoordinate),
    getUser
  )(engine)
}

export const selectSpaceshipDestination = destination => engine => {
  const state = engine.getState()
  return compose(
    state.onSetDestination,
    updatedPlayerList(engine),
    setSelectedDestination(destination),
    getUser
  )(engine)
}

export const selectSpaceship = spaceship => engine => {
  const state = engine.getState()
  return compose(
    state.onSelectSpaceship(spaceship),
    updatedPlayerList(engine),
    selectUserSpaceship(spaceship),
    getUser
  )(engine)
}
