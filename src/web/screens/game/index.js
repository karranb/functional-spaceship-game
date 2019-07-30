import Engine from '_models/engine'
import { newRound } from '_models/engine/functions'
import { rotate, setCoordinate } from '_models/spaceship/functions'
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
import { either } from '_utils/logic'
import { getById } from '_utils/dom'
import { compose, map } from '_utils/base'
import { getProp } from '_utils/model'
import { supportWasm, timed } from '_utils/helper'
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

/**
 * Creates the game graphics, listeners, engine and starts a new round.
 *
 * @param {Player} user
 * @param {Player} enemy
 */
export const startGame = (user, enemy) => {
  const graphicController = setupGameView(GAME_SIZE, getById('game'))
  const readyBtnId = 'btn_ready'
  const background = Background()
  addChild(graphicController)(background)

  const positionateSpaceship = (coordinate, degrees) =>
    compose(
      rotate(degrees),
      setCoordinate(coordinate)
    )

  const positionateUserSpaceship = i =>
    positionateSpaceship(USER_SPACESHIP_COORDINATES[i], BOTTOM_RIGHT_ANGLE)

  const positionateEnemySpaceship = i =>
    positionateSpaceship(ENEMY_SPACESHIP_COORDINATES[i], TOP_LEFT_ANGLE)

  const spaceshipListeners = {
    onRotate,
    onSetCoordinate,
    onStop: onSpaceshipStop(graphicController),
    onDestroy: onDestroySpaceship(graphicController),
  }

  const newSpaceshipGraphic = compose(
    addChild(graphicController),
    SpaceshipGraphic
  )

  const setupSpaceship = positionateFn => (spaceship, i) => {
    const newSpaceship = spaceship.assignState({
      ...spaceshipListeners,
      graphic: newSpaceshipGraphic(spaceship),
    })
    return positionateFn(i)(newSpaceship)
  }

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
  import('_web/webassembly').then(wasm => {
    timed('between polygons without wasm', () =>
      checkCollisionBetweenPolygons(
        748.0028779543477,
        450.1072545326296,
        44.7,
        32.9,
        3.0879396496560054,
        748.0028779543477,
        450.1072545326296,
        44.7,
        32.9,
        3.0879396496560054
      )
    )
    timed('between polygons with wasm', () =>
      wasm.checkCollisionBetweenPolygons(
        748.0028779543477,
        450.1072545326296,
        44.7,
        32.9,
        3.0879396496560054,
        748.0028779543477,
        450.1072545326296,
        44.7,
        32.9,
        3.0879396496560054
      )
    )
    newRound(
      Engine({
        players: [
          setupPlayer(positionateUserSpaceship, user),
          setupPlayer(positionateEnemySpaceship, enemy),
        ],
        onSelectSpaceship,
        background,
        graphicController,
        readyBtnId,
        onStartUpdate,
        onUpdate,
        onGameEnd,
        onNewRound,
        checkCollisionSquareCircle: supportWasm()
          ? wasm.checkCollisionSquareCircle
          : checkCollisionSquareCircle,
        checkCollisionBetweenPolygons: supportWasm()
          ? wasm.checkCollisionBetweenPolygons
          : checkCollisionBetweenPolygons,
      })
    )
  })
}
