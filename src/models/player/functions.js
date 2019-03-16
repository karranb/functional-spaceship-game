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
import { either, Maybe } from '../../utils/functions/maybe';
import { compose, map } from '_utils/functions/base'

const mapMaybe = fn => maybe => map(maybe, fn) 
const assignState = state => element => element.assignState(state)
const flip = fn => x => y => fn(y)(x)
// const getProp = prop => element => element.getProp(prop)
const getProp = prop => element => element.getProp ? element.getProp(prop) : Maybe(element[prop])

const cEither = other => maybe => either(maybe, other)
const always = x => () => x



const getSpaceships = player => compose(
  cEither([]),
  getProp('spaceships')
)(player)


/**
 * return player's selected spaceship
 */
export const getSelected = player => getSpaceships(player).find(isSelected)

/**
 * return player's unselected spaceships
 */
const getUnselected = player => getSpaceships(player).filter(isNotSelected)

/**
 * return players' spaceships
 */
const reduceGetSpaceships = (acc, player) => ([ ...acc, ...getSpaceships(player)])

const getPlayersSpaceships = players => players.reduce(reduceGetSpaceships, [])

/**
 * return players' spaceships, beside the current one
 */
const getOtherSpaceships = players => spaceship =>
  getPlayersSpaceships(players).filter(item => item !== spaceship)


/**
 * Return true if the player is the user
 */
export const isUser = player => compose(
  cEither(false),
  getProp('isUser')
)(player)


/**
 * Return false if the player is the user
 */
export const isNotUser = player => !isUser(player)

/**getSpaceships
 * Replace the selected spaceship
 */

export const replaceSelected = player => selectedSpaceship =>
  compose(
    spaceships => player.assignState({ spaceships }),
    unselectedSpaceships => ([ selectedSpaceship, ...unselectedSpaceships]),
    getUnselected
  )(player)

/**
 * disselect player spaceships and select one
 */
export const selectSpaceship = spaceship => player => {
  const playerOtherSpaceships = getSpaceships(player).filter(sp => sp !== spaceship).map(disselect)
  const spaceships = [...playerOtherSpaceships, select(spaceship)]
  return player.assignState({ spaceships })
}

/**
 * return true if the player spaceships are ready
 */
export const isReady = player => getSpaceships(player).every(isSpaceshipReady)


/**
 * update player spaceships state
 */   
export const update = player => compose(
  spaceships => player.assignState({ spaceships }),
  spaceships => spaceships.map(updateSpaceship),
  getSpaceships
)(player)

/**
 * Process player elements collisions
 */
export const processCollisions = player => players => {
  const cGetOtherSpaceships = getOtherSpaceships(players)

  const processCollisionsWithOthers = spaceship =>
    processSpaceshipCollisions(cGetOtherSpaceships(spaceship))(spaceship)
  const spaceships = getSpaceships(player).map(processCollisionsWithOthers)
  return player.assignState({ spaceships })
}

const getAliveSpaceships = player => getSpaceships(player).filter(isAlive)

/**
 * remove destroyed spaceships from player listx
 */
export const removeDestroyedSpaceships = player =>
  player.assignState({ spaceships: getAliveSpaceships(player) })


/**
 * Set the player's selected spaceship target
 */
export const setSelectedTarget = target => player =>
  compose(
    replaceSelected(player),
    setTarget(target),
    getSelected
  )(player)


/**
 * set the player's selected spaceship destination
 */
export const setSelectedDestination = destination => player =>
  compose(
    replaceSelected(player),
    setDestination(destination),
    getSelected
  )(player)
