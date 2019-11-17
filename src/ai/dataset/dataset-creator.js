import { createObjectCsvWriter } from 'csv-writer'

import Engine from '_models/engine'
import { newRound, update } from '_models/engine/functions'
import { rotate, setCoordinate } from '_models/spaceship/functions'
import Player from '_models/player'
import {
  TOP_LEFT_ANGLE,
  BOTTOM_RIGHT_ANGLE,
  ENEMY_SPACESHIP_COORDINATES,
  USER_SPACESHIP_COORDINATES,
  SPACESHIP_TYPES,
} from '_utils/constants'
import { either, fEither } from '_utils/logic'
import { compose, map } from '_utils/base'
import { getProp } from '_utils/model'
import { checkCollisionSquareCircle, checkCollisionBetweenPolygons } from '_utils/collision'
import {
  selectSpaceshipDestination as selectAISpaceshipDestination,
  selectSpaceshipTarget as selectAISpaceshipTarget,
} from '_ai/dumb'
import { callListenerIfExist } from '_utils/helper'

// spaceship_[i]_x
// spaceship_[i]_y
// spaceship_target_[i]_x
// spaceship_target_[i]_y
// spaceship_[i]_health_before
// spaceship_[i]_health_after
// spaceship_[i]_target_hit

let currentGame = 0
let states = []

const user = Player({
  id: 0,
  spaceships: [
    SPACESHIP_TYPES.spaceship1.assignState({ id: 0 }),
    SPACESHIP_TYPES.spaceship1.assignState({ id: 1 }),
    SPACESHIP_TYPES.spaceship1.assignState({ id: 2 }),
  ],
  isUser: true,
})
const enemy = Player({
  id: 1,
  spaceships: [
    SPACESHIP_TYPES.spaceship1.assignState({ id: 0 }),
    SPACESHIP_TYPES.spaceship1.assignState({ id: 1 }),
    SPACESHIP_TYPES.spaceship1.assignState({ id: 2 }),
  ],
})

const statesToCSV = () => {
  const parsedStates = states.map(state =>
    Object.keys(state).reduce(
      (playersAcc, playerId) => ({
        ...playersAcc,
        ...Object.keys(state[playerId]).reduce(
          (spaceshipsAcc, spaceshipId) => ({
            ...spaceshipsAcc,
            [`player_${playerId}_spaceship_${spaceshipId}_current_x`]: state[playerId][spaceshipId]
              .currentX,
            [`player_${playerId}_spaceship_${spaceshipId}_current_y`]: state[playerId][spaceshipId]
              .currentY,
            [`player_${playerId}_spaceship_${spaceshipId}_destination_x`]: state[playerId][
              spaceshipId
            ].destinationX,
            [`player_${playerId}_spaceship_${spaceshipId}_destination_y`]: state[playerId][
              spaceshipId
            ].destinationY,
            [`player_${playerId}_spaceship_${spaceshipId}_shield_before`]: state[playerId][
              spaceshipId
            ].shieldBefore,
            [`player_${playerId}_spaceship_${spaceshipId}_shield_after`]: state[playerId][
              spaceshipId
            ].shieldAfter,

            [`player_${playerId}_spaceship_${spaceshipId}_target_x`]: state[playerId][spaceshipId]
              .targetX,
            [`player_${playerId}_spaceship_${spaceshipId}_target_y`]: state[playerId][spaceshipId]
              .targetY,
            [`player_${playerId}_spaceship_${spaceshipId}_target_hit`]: state[playerId][spaceshipId]
              .targetHit,
          }),
          {}
        ),
      }),
      {}
    )
  )
  const csvWriter = createObjectCsvWriter({
    path: 'out.csv',
    header: Object.keys(parsedStates[0]).map(item => ({ id: item, title: item })),
  })
  csvWriter
    .writeRecords(parsedStates)
    .then(() => console.log('The CSV file was written successfully'))
}

const startGame = () => {
  const positionateSpaceship = (coordinate, degrees) =>
    compose(
      rotate(degrees),
      setCoordinate(coordinate)
    )

  const positionateUserSpaceship = i =>
    positionateSpaceship(USER_SPACESHIP_COORDINATES[i], BOTTOM_RIGHT_ANGLE)

  const positionateEnemySpaceship = i =>
    positionateSpaceship(ENEMY_SPACESHIP_COORDINATES[i], TOP_LEFT_ANGLE)

  let currentState = {}
  let futureState = {}

  const setupSpaceship = positionateFn => (spaceship, i) =>
    positionateFn(i)(
      spaceship.assignState({
        onBulletHit: (bullet, engine) => {
          const players = either(engine.getProp('players'), [])
          players.forEach(player => {
            const spaceships = either(player.getProp('spaceships'), [])
            spaceships.forEach(s => {
              const bullets = either(s.getProp('bullets'), [])
              if (bullets.find(x => x === bullet)) {
                currentState[player.getState().id][s.getState().id].targetHit = true
              }
            })
          })
        },
      })
    )

  const eitherSpaceships = spaceships => either(spaceships, [])

  const setupPlayerSpaceships = positionateFn =>
    compose(
      eitherSpaceships,
      map(map(setupSpaceship(positionateFn))),
      getProp('spaceships')
    )

  const setupPlayer = (positionateFn, player) =>
    compose(
      spaceships => player.assignState({ spaceships }),
      setupPlayerSpaceships(positionateFn)
    )(player)

  const AIFunctions = otherSpaceships => spaceship =>
    compose(
      selectAISpaceshipTarget(otherSpaceships),
      selectAISpaceshipDestination
    )(spaceship)

  const getSpaceships = (spaceships, otherPlayer) =>
    compose(
      fEither(spaceships),
      map(otherSpaceships => [...spaceships, ...otherSpaceships]),
      getProp('spaceships')
    )(otherPlayer)

  const setAIRoundStart = otherPlayers => player => {
    const otherSpaceships = otherPlayers.reduce(getSpaceships, [])
    return compose(
      spaceships => player.assignState({ spaceships }),
      fEither([]),
      map(spaceships => spaceships.map(AIFunctions(otherSpaceships))),
      getProp('spaceships')
    )(player)
  }

  const saveState = (players, gameEnd = false) => {
    let addState = false
    players.forEach(player => {
      const playerId = player.getState().id
      const currentPlayerState = currentState[playerId] || {}

      const spaceships = either(player.getProp('spaceships'), [])
      spaceships.forEach(spaceship => {
        const spaceshipState = spaceship.getState()
        const { id: spaceshipId } = spaceshipState
        if (!currentPlayerState[spaceshipId]) {
          currentPlayerState[spaceshipId] = {
            currentX: spaceshipState.coordinate.x(),
            currentY: spaceshipState.coordinate.y(),
            destinationX: spaceshipState.destination.x(),
            destinationY: spaceshipState.destination.y(),
            shieldBefore: spaceshipState.shield,
            targetX: spaceshipState.targetCoordinate.x(),
            targetY: spaceshipState.targetCoordinate.y(),
            targetHit: false,
            shieldAfter: 0,
          }
        } else {
          addState = true
          currentPlayerState[spaceshipId] = {
            ...currentPlayerState[spaceshipId],
            shieldAfter: spaceshipState.shield,
          }
        }
        currentState[playerId] = currentPlayerState
        if (gameEnd) return
        const futurePlayerState = futureState[playerId] || {}
        futureState = {
          ...futureState,
          [playerId]: {
            ...futurePlayerState,
            [spaceshipId]: {
              currentX: spaceshipState.coordinate.x(),
              currentY: spaceshipState.coordinate.y(),
              destinationX: spaceshipState.destination.x(),
              destinationY: spaceshipState.destination.y(),
              shieldBefore: spaceshipState.shield,
              targetX: spaceshipState.targetCoordinate.x(),
              targetY: spaceshipState.targetCoordinate.y(),
              targetHit: false,
              shieldAfter: 0,
            },
          },
        }
      })
    })
    if (addState) states.push(currentState)
    currentState = futureState
    futureState = {}
  }

  newRound(
    Engine({
      players: [
        setupPlayer(positionateUserSpaceship, user),
        setupPlayer(positionateEnemySpaceship, enemy),
      ],
      onStartUpdate: engine => {
        update(engine)
      },
      onUpdate: engine => process.nextTick(() => update(engine)),
      onGameEnd: engine => {
        console.log('gameEnd ' + currentGame)
        const players = either(engine.getProp('players'), [])
        saveState(players, true)
        currentState = {}
        futureState = {}
        currentGame += 1
        if (currentGame < 1000) startGame()
        else statesToCSV()
      },
      onNewRound: engine => {
        // console.log('newRound')
        // console.log('player 0')
        // engine
        //   .getState()
        //   .players[0].getState()
        //   .spaceships.forEach((spaceship, i) => console.log(i, spaceship.getState().shield))
        // console.log('player 1')
        // engine
        //   .getState()
        //   .players[1].getState()
        //   .spaceships.forEach((spaceship, i) => console.log(i, spaceship.getState().shield))

        const otherPlayer = player =>
          compose(
            fEither([]),
            map(players => players.filter(x => x !== player)),
            getProp('players')
          )
        const newPlayers = engine.getProp('players').map(players =>
          map(player => {
            const other = otherPlayer(player)(engine)
            return setAIRoundStart(other)(player)
          })(players)
        )
        const newEngine = engine.assignState({ players: newPlayers })

        const players = either(newEngine.getProp('players'), [])
        // const lastState = playersStates.length ? playersStates[0] : {}
        // let removeOldState = false
        saveState(players)

        return callListenerIfExist('onStartUpdate')(newEngine)
      },
      checkCollisionSquareCircle,
      checkCollisionBetweenPolygons,
    })
  )
}
startGame()

// for (let i = 0; i < 2; i++) {
//   startGame(user, enemy)
// }
// const wow = (...args) => console.log(...args)

// export default wow
