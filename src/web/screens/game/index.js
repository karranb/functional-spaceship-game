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
import { compose } from '_utils/base'

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

  const positionateSpaceship = coordinate => degrees =>
    compose(
      rotate(degrees),
      setCoordinate(coordinate)
    )

  const positionateUserSpaceship = i =>
    positionateSpaceship(USER_SPACESHIP_COORDINATES[i])(BOTTOM_RIGHT_ANGLE)

  const positionateEnemySpaceship = i =>
    positionateSpaceship(ENEMY_SPACESHIP_COORDINATES[i])(TOP_LEFT_ANGLE)

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

  const setupSpaceships = positionateFn =>
    compose(
      eitherSpaceships,
      player =>
        player
          .getProp('spaceships')
          .map(spaceships => spaceships.map(setupSpaceship(positionateFn)))
    )

  const setupPlayer = positionateFn => player => {
    const spaceships = setupSpaceships(positionateFn)(player)
    return player.assignState({ spaceships })
  }

  const setupUser = setupPlayer(positionateUserSpaceship)
  const setupEnemy = setupPlayer(positionateEnemySpaceship)
  newRound(
    Engine({
      players: [setupUser(user), setupEnemy(enemy)],
      onSelectSpaceship: onSelectSpaceship(graphicController),
      background,
      readyBtnId,
      onStartUpdate: onStartUpdate(graphicController),
      onUpdate,
      onGameEnd,
      onNewRound,
    })
  )
}
