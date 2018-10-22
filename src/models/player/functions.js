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
import { either } from '../../utils/functions/maybe';

/**
 * return player's selected spaceship
 */
export const getSelected = player => player.getProp('spaceships').map(spaceships => spaceships.find(isSelected))

/**
 * return player's unselected spaceships
 */
const getUnselected = player => player.getProp('spaceships').map(spaceships => spaceships.filter(isNotSelected))

/**
 * return players' spaceships
 */
const getPlayersSpaceships = players => {
  const curriedGetPlayers = (acc, player) => {
    const spaceships =  either(player.getProp('spaceships'), [])
    return [ ...acc, ...spaceships ]
  }
  return players.reduce(curriedGetPlayers, [])
}

/**
 * return players' spaceships, beside the current one
 */
const getOtherSpaceships = players => spaceship => {
  const allSpaceships = getPlayersSpaceships(players)
  return allSpaceships.filter(item => item !== spaceship)
}

/**
 * Return true if the player is the user
 */
export const isUser = player => either(player.getProp('isUser'), false)

/**
 * Return false if the player is the user
 */
export const isNotUser = player => !isUser(player)

/**
 * Replace the selected spaceship
 */
export const replaceSelected = spaceship => player => {
  const spaceships = [...getUnselected(player), spaceship]
  return player.assignState({ spaceships })
}

/**
 * disselect player spaceships and select one
 */
export const selectSpaceship = spaceship => player => {
  const playerOtherSpaceships = either(player.getProp('spaceships').map(spaceships => spaceships.filter(sp => sp !== spaceship).map(disselect)), [])
  const spaceships = [...playerOtherSpaceships, select(spaceship)]
  return player.assignState({ spaceships })
}

/**
 * return true if the player spaceships are ready
 */
export const isReady = player => 
  player.getProp('spaceships').map(spaceships => spaceships.every(isSpaceshipReady))


/**
 * update player spaceships state
 */   
export const update = player => {
  const spaceships = either(player.getProp('spaceships').map(spaceships => spaceships.map(updateSpaceship)), [])
  return player.assignState({ spaceships })
}

/**
 * Process player elements collisions
 */
export const processCollisions = player => players => {
  const cGetOtherSpaceships = getOtherSpaceships(players)

  const processCollisionsWithOthers = spaceship =>
    processSpaceshipCollisions(cGetOtherSpaceships(spaceship))(spaceship)

  const spaceships = either(player.getProp('spaceships').map(spaceships => spaceships.map(processCollisionsWithOthers)), [])
  return player.assignState({ spaceships })
}

/**
 * remove destroyed spaceships from player list
 */
export const removeDestroyedSpaceships = player => {
  const spaceships = either(player.getProp('spaceships').map(spaceships => spaceships.filter(isAlive)), [])
  return player.assignState({ spaceships })
}

/**
 * Set the player's selected spaceship target
 */
export const setSelectedTarget = target => player => {
  const selectedSpaceship = getSelected(player)
  const unselectedSpaceships = getUnselected(player)
  const spaceship = setTarget(target)(selectedSpaceship)
  return player.assignState({ spaceships: [ spaceship, ...unselectedSpaceships ] })
}

/**
 * set the player's selected spaceship destination
 */
export const setSelectedDestination = destination => player => {
  const selectedSpaceship = getSelected(player)
  const unselectedSpaceships = getUnselected(player)
  const spaceship = setDestination(destination)(selectedSpaceship)
  return player.assignState({ spaceships: [ spaceship, ...unselectedSpaceships ] })
}
