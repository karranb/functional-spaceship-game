import Engine from '_models/engine'
import { newRound } from '_models/engine/functions'
import { rotate, setCoordinate } from '_models/spaceship/functions'
import { getSpaceships, setSpaceships } from '_models/player/functions'
import Background from '_web/components/background'
import { setupGameView, addChild } from '_web/graphic'
import { Spaceship as SpaceshipGraphic } from '_web/components/spaceship'
import {
  TOP_LEFT_ANGLE,
  BOTTOM_RIGHT_ANGLE,
  ENEMY_SPACESHIP_COORDINATES,
  USER_SPACESHIP_COORDINATES,
  GAME_SIZE,
} from '_utils/constants'
import { getById } from '_utils/dom'
import { compose, map, curry } from '_utils/base'
import { supportWasm } from '_utils/helper'
import { checkCollisionSquareCircle, checkCollisionBetweenPolygons } from '_utils/collision'

import {
  onRotate,
  onSetCoordinate,
  onDestroySpaceship,
  onSelectSpaceship,
  onSpaceshipStop,
  onStartUpdate,
  onUpdate,
  onNewRound,
  onGameEnd,
} from './listeners'

const readyBtnId = 'btn_ready'

const graphicController = setupGameView(GAME_SIZE, getById('game'))

const background = Background()

const positionateSpaceship = curry((coordinate, degrees, spaceship) =>
  compose(rotate(degrees), setCoordinate(coordinate))(spaceship)
)

const positionateUserSpaceship = curry((i, spaceship) =>
  positionateSpaceship(USER_SPACESHIP_COORDINATES[i], BOTTOM_RIGHT_ANGLE, spaceship)
)

const positionateEnemySpaceship = curry((i, spaceship) =>
  positionateSpaceship(ENEMY_SPACESHIP_COORDINATES[i], TOP_LEFT_ANGLE, spaceship)
)

const spaceshipListeners = {
  onRotate,
  onSetCoordinate,
  onStop: onSpaceshipStop(graphicController),
  onDestroy: onDestroySpaceship(graphicController),
}

const newSpaceshipGraphic = compose(addChild(graphicController), SpaceshipGraphic)

const setupSpaceship = positionateFn => (spaceship, i) => {
  const newSpaceship = spaceship.assignState({
    ...spaceshipListeners,
    graphic: newSpaceshipGraphic(spaceship),
  })
  return positionateFn(i, newSpaceship)
}

const setupPlayerSpaceships = positionateFn =>
  compose(map(setupSpaceship(positionateFn)), getSpaceships)

const setupPlayer = (positionateFn, player) =>
  compose(setSpaceships(player), setupPlayerSpaceships(positionateFn))(player)

const engineWebElements = {
  background,
  readyBtnId,
  graphicController,
}

const engineListeners = {
  onSelectSpaceship,
  onStartUpdate,
  onUpdate,
  onGameEnd,
  onNewRound,
}

const getCheckCollisionSquareCircle = wasm =>
  supportWasm() ? wasm.checkCollisionSquareCircle : checkCollisionSquareCircle

const getCheckCollisionBetweenPolygons = wasm =>
  supportWasm() ? wasm.checkCollisionBetweenPolygons : checkCollisionBetweenPolygons

const setupPlayers = map(({ player, positionateFn }) => setupPlayer(positionateFn, player))

const startFirstRound = players =>
  import('_web/webassembly').then(wasm =>
    newRound(
      Engine({
        ...engineWebElements,
        ...engineListeners,
        players,
        checkCollisionSquareCircle: getCheckCollisionSquareCircle(wasm),
        checkCollisionBetweenPolygons: getCheckCollisionBetweenPolygons(wasm),
      })
    )
  )

export const startGame = (user, enemy) => {
  addChild(graphicController)(background)
  const players = setupPlayers([
    { player: user, positionateFn: positionateUserSpaceship },
    { player: enemy, positionateFn: positionateEnemySpaceship },
  ])
  startFirstRound(players)
}
