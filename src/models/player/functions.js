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
import { compose, map, curry } from '_utils/base'
import { find, filter, every } from '_utils/array'
import { getProp } from '_utils/model'
import { diff, not, fEither } from '_utils/logic'

/**
 *
 * player -> [spaceships]
 */
export const getSpaceships = compose(fEither([]), getProp('spaceships'))

export const setSpaceships = curry((player, spaceships) => player.assignState({ spaceships }))

/**
 * return player's selected spaceship
 * player -> spaceship
 */
export const getSelected = compose(find(isSelected), getSpaceships)

/**
 * return player's unselected spaceships
 * player -> [spaceship]
 */
const getUnselected = compose(filter(isNotSelected), getSpaceships)

/**
 * Return true if the player is the user
 * player -> bool
 */
export const isUser = compose(fEither(false), getProp('isUser'))

/**
 * Return false if the player is the user
 * player -> bool
 */
export const isNotUser = compose(not, isUser)

/** getSpaceships
 * Replace the selected spaceship
 */

export const replaceSelected = curry((player, selectedSpaceship) =>
  compose(
    setSpaceships(player),
    unselectedSpaceships => [selectedSpaceship, ...unselectedSpaceships],
    getUnselected
  )(player)
)

/**
 * disselect player spaceships and select one
 */
export const selectSpaceship = curry((spaceship, player) =>
  compose(
    setSpaceships(player),
    otherSpaceships => [...map(disselect, otherSpaceships), select(spaceship)],
    filter(sp => diff(spaceship, sp)),
    getSpaceships
  )(player)
)

/**
 * return true if the player spaceships are ready
 * player -> book
 */
export const isReady = compose(every(isSpaceshipReady), getSpaceships)

/**
 * update player spaceships state
 */

export const update = player =>
  compose(setSpaceships(player), map(updateSpaceship), getSpaceships)(player)

/**
 * player -> [spaceships]
 */
const getAliveSpaceships = compose(filter(isAlive), getSpaceships)

/**
 * remove destroyed spaceships from player listx
 */
export const removeDestroyedSpaceships = player =>
  compose(setSpaceships(player), getAliveSpaceships)(player)

/**
 * Set the player's selected spaceship target
 */
export const setSelectedTarget = curry((target, player) =>
  compose(replaceSelected(player), setTarget(target), getSelected)(player)
)
/**
 * set the player's selected spaceship destination
 */
export const setSelectedDestination = curry((destination, player) =>
  compose(replaceSelected(player), setDestination(destination), getSelected)(player)
)
