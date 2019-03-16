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
import { compose, map } from '_utils/functions/base'

import Engine from './index'
import { either } from '../../utils/functions/maybe';

const mapMaybe = fn => maybe => map(maybe, fn) 
const assignState = state => element => element.assignState(state)
const flip = fn => x => y => fn(y)(x)
// const getProp = prop => element => element.getProp(prop)
const getProp = prop => element => element.getProp ? element.getProp(prop) : Maybe(element[prop])

const cEither = other => maybe => either(maybe, other)
const always = x => () => x


/**
 * Get player that is controlled by user
 */
export const getUser = engine => compose(
  cEither(null),
  mapMaybe(players => players.find(isUser)),
  getProp('players')
)(engine)


/**
 * get players that are not contrlled by user
 */
export const getNonUsers = engine => compose(
  cEither([]),
  mapMaybe(players => players.filter(isNotUser)),
  getProp('players')
)(engine)

/**
 * Start a new round
 */

const filter = fn => array => array.filter(fn)
const lenght = array => array.length


const getRoundAndIncrement = compose(
  cEither(1),
  mapMaybe(round => round + 1),
  getProp('round')
)

const getSpaceshipsLen = compose(
  cEither(0),
  mapMaybe(lenght),
  getProp('spaceships')
)

const getRemanainingSpaceships = compose(
  cEither([]),
  mapMaybe(
    compose(
      filter(getSpaceshipsLen),
      players => map(players, removeDestroyedSpaceships)
    )
  ),
  getProp('players')
)


const callListenerIfExist = listenerName => (...args) => model => 
  compose(
    cEither(model),
    maybeFn => maybeFn.map(fn => fn(...args)),
    getProp(listenerName)
  )(model)


const ifElse = (cond, onTrue, onFalse) => (...args) => cond(...args) ? onTrue() : onFalse()

const setNewRoundState = (round, players) => engine => compose(
  newEngine => ifElse(  
    always(round >= MAX_ROUNDS || players.length <= 1),
    always(callListenerIfExist('onGameEnd')(newEngine)(newEngine)),
    always(callListenerIfExist('onNewRound')(newEngine)(newEngine)),
  )(newEngine),
  assignState({
    round: getRoundAndIncrement(engine),
    players: getRemanainingSpaceships(engine),
  })
)(engine)


export const newRound = engine => setNewRoundState(
  getRoundAndIncrement(engine),
  getRemanainingSpaceships(engine),
)(engine)



//  compose(
//    set

//  )(engine)


//   // const round = getRoundAndIncrement(engine)

//   // const players = getRemanainingSpaceships(engine)
  

//   // const newEngine = engine.assignState({ round, players })

//   if (round >= MAX_ROUNDS || players.length <= 1) {
//     engine.getProp('onGameEnd').apply(newEngine)
//     return newEngine
//   }
//   engine.getProp('onNewRound').apply(newEngine)
//   return newEngine
// }

/**
 * Update engine's state
 */

const getPlayers = compose(
  cEither([]),
  mapMaybe(
    compose(
      players => map(players, (player, _, playersList) => processCollisions(player)(playersList)),
      players => map(players, updatePlayer)
    )
  ),
  getProp('players') 
)

const isPlayerReady = player => isReady(player)

const arePlayersReady = players => players.every(isPlayerReady)

const setUpdateState = engine => players => compose(
  newEngine => ifElse(
    () => arePlayersReady(players),
    () => newRound(newEngine),
    () =>  callListenerIfExist('onUpdate')(newEngine)(newEngine)
  )(newEngine),
  assignState({ players })
)(engine)

export const update = engine =>
  compose(
    setUpdateState(engine),
    getPlayers
  )(engine)

/**
 * Start to update engine
 */
export const startUpdate = engine => callListenerIfExist('onStartUpdate')(engine)(engine)

// engine.getProp('onStartUpdate').apply(engine)


/**
 * update engine player list
 */
const updateUser = engine => user => 
  compose(
    otherPlayers => assignState({ players: [...otherPlayers, user]})(engine),
    getNonUsers
  )(engine)
// {
//   const otherPlayers = getNonUsers(engine)
//   return engine.assignState({ players: [ ...otherPlayers, user ] })
// }

/**
 * Get user selected spaceship
 */
export const getSelectedSpaceship = compose(getSelected, getUser)


/**
 * replace user selected spaceship
 */
export const replaceSelectedSpaceship = spaceship => engine =>
  compose(
    updateUser(engine),
    user => replaceSelected(user)(spaceship),
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


/**
 * set a user spaceship as selected
 */
export const selectSpaceship = spaceship => engine => {
  const newEngine = compose(
    updateUser(engine),
    selectUserSpaceship(spaceship),
    getUser
  )(engine)
  // newEngine.getProp('onSelectSpaceship').apply(spaceship)(newEngine)
  newEngine.getProp('onSelectSpaceship').map(fn => fn(spaceship)(newEngine))
  return newEngine
}