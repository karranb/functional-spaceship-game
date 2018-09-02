import {
  isReady as isSpaceshipReady,
  isSelected,
  isNotSelected,
  select,
  isAlive,
  update as updateSpaceship,
  setTarget,
  setDestination,
  disselect,
} from '_models/spaceship/functions'
import { compose, map } from '_utils/base'
import { find, filter, every } from '_utils/array'
import { getProp } from '_utils/model'
import { diff, not, fEither } from '_utils/logic'

export const getSpaceships = player =>
  compose(
    fEither([]),
    getProp('spaceships')
  )(player)

/**
 * return player's selected spaceship
 */
export const getSelected = player =>
  compose(
    find(isSelected),
    getSpaceships
  )(player)

/**
 * return player's unselected spaceships
 */
const getUnselected = player =>
  compose(
    filter(isNotSelected),
    getSpaceships
  )(player)

/**
 * Return true if the player is the user
 */
export const isUser = player =>
  compose(
    fEither(false),
    getProp('isUser')
  )(player)

/**
 * Return false if the player is the user
 */
export const isNotUser = player => not(isUser(player))

/** getSpaceships
 * Replace the selected spaceship
 */

export const replaceSelected = player => selectedSpaceship =>
  compose(
    spaceships => player.assignState({ spaceships }),
    unselectedSpaceships => [selectedSpaceship, ...unselectedSpaceships],
    getUnselected
  )(player)

/**
 * disselect player spaceships and select one
 */
export const selectSpaceship = spaceship => player =>
  compose(
    spaceships => player.assignState({ spaceships }),
    otherSpaceships => [...map(disselect, otherSpaceships), select(spaceship)],
    filter(sp => diff(spaceship, sp)),
    getSpaceships
  )(player)

/**
 * return true if the player spaceships are ready
 */
export const isReady = player =>
  compose(
    every(isSpaceshipReady),
    getSpaceships
  )(player)

/**
 * update player spaceships state
 */

export const update = player =>
  compose(
    spaceships => player.assignState({ spaceships }),
    map(updateSpaceship),
    getSpaceships
  )(player)

const getAliveSpaceships = player =>
  compose(
    filter(isAlive),
    getSpaceships
  )(player)

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
