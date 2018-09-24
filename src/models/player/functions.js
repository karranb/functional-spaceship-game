import Player from '_models/player'
import {
  isReady as isSpaceshipReady,
  isSelected,
  isNotSelected,
  disselect,
  select,
  processCollisions as processSpaceshipCollisions,
  isAlive,
  update as updateSpaceship,
  setTarget,
  setDestination,
} from '_models/spaceship/functions'

export const getSelected = player => player.getState().spaceships.find(isSelected)

const getUnselected = player => player.getState().spaceships.filter(isNotSelected)

const getPlayersSpaceships = players => {
  const curriedGetPlayers = (acc, player) => [...acc, ...player.getState().spaceships]
  return players.reduce(curriedGetPlayers, [])
}

const getOtherSpaceships = players => spaceship => {
  const allSpaceships = getPlayersSpaceships(players)
  return allSpaceships.filter(item => item !== spaceship)
}

export const isUser = player => player.getState().isUser
export const isNotUser = player => !player.getState().isUser

export const replaceSelected = spaceship => player => {
  const state = player.getState()
  const spaceships = [...getUnselected(player), spaceship]
  return Player({
    ...state,
    spaceships,
  })
}

export const selectSpaceship = spaceship => player => {
  const state = player.getState()
  const playerOtherSpaceships = state.spaceships.filter(sp => sp !== spaceship).map(disselect)

  const spaceships = [...playerOtherSpaceships, select(spaceship)]
  const selectedSpaceshipPlayer = Player({
    ...state,
    spaceships,
  })
  return selectedSpaceshipPlayer
}

export const isReady = player => {
  const state = player.getState()
  return state.spaceships.every(isSpaceshipReady)
}

export const update = player => {
  const state = player.getState()
  const spaceships = state.spaceships.map(updateSpaceship)
  return Player({
    ...state,
    spaceships,
  })
}

export const processCollisions = player => players => {
  const state = player.getState()
  const cGetOtherSpaceships = getOtherSpaceships(players)
  const processCollisionsWithOthers = spaceship =>
    processSpaceshipCollisions(cGetOtherSpaceships(spaceship))(spaceship)
  const spaceships = state.spaceships.map(processCollisionsWithOthers)
  return Player({
    ...state,
    spaceships,
  })
}

export const removeDestroyedSpaceships = player => {
  const state = player.getState()
  const spaceships = state.spaceships.filter(isAlive)
  return Player({
    ...state,
    spaceships,
  })
}

export const addSpaceship = player => {
  const state = player.getState()
  return spaceship => {
    const spaceships = [...state.spaceships, spaceship]
    return Player({
      ...state,
      spaceships,
    })
  }
}

export const setSelectedTarget = target => player => {
  const state = player.getState()
  const selectedSpaceship = getSelected(player)
  const unselectedSpaceships = getUnselected(player)
  const spaceship = setTarget(target)(selectedSpaceship)
  return Player({
    ...state,
    spaceships: [spaceship, ...unselectedSpaceships],
  })
}

export const setSelectedDestination = destination => player => {
  const state = player.getState()
  const selectedSpaceship = getSelected(player)
  const unselectedSpaceships = getUnselected(player)
  const spaceship = setDestination(destination)(selectedSpaceship)
  return Player({
    ...state,
    spaceships: [spaceship, ...unselectedSpaceships],
  })
}
