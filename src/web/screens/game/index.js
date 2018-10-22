import Engine from '_models/engine'
import { newRound } from '_models/engine/functions'
import Player from '_models/player'
import Spaceship from '_models/spaceship'
import { rotate, setCoordinate } from '_models/spaceship/functions'
import Background from '_web/components/background'
import { setupGameView, addChild } from '_web/graphic'
import { Spaceship as SpaceshipGraphic, MovingSpaceship } from '_web/components/spaceship'
import {
  TOP_LEFT_ANGLE,
  BOTTOM_RIGHT_ANGLE,
  ENEMY_SPACESHIP_COORDINATES,
  USER_SPACESHIP_COORDINATES,
  GAME_SIZE,
} from '_utils/constants'
import { getById } from '_utils/functions/helper'
import { compose } from '_utils/functions/base'
// import userSpaceshipImg from '_assets/images/spaceship/blue/blue-still.png'
// import enemySpaceshipImg from '_assets/images/spaceship/red/red-still.png'
import { isNothing } from '_utils/functions/maybe';


import {
  onRotate,
  onSetCoordinate,
  onDestroySpaceship,
  onSelectSpaceship,
  onSpaceshipStop,
  onSetDestination,
  onSetTarget,
  onStartUpdate,
  onUpdate,
  onNewRound,
  onGameEnd,
} from './listeners'


export const startGame = (user, enemy) => {
  const div = getById('game')
  const readyBtnId = 'btn_ready'
  const graphic = setupGameView(GAME_SIZE, div)

  const background = Background()
  addChild(background)(graphic)

  const positionateSpaceship = coordinate => degrees =>
    compose(
      rotate(degrees),
      setCoordinate(coordinate)
    )

  const baseSpaceship = Spaceship({
    onRotate,
    onSetCoordinate,
    onStop: onSpaceshipStop(graphic),
    onDestroy: onDestroySpaceship(graphic),
  })

  const setupUser = player => {
    const spaceships = player.getProp('spaceships').map(
      spaceships => spaceships.map((spaceship, i) => {
        const spaceshipGraphic = SpaceshipGraphic(spaceship)
        addChild(spaceshipGraphic)(graphic)
        const newSpaceship = spaceship.assignState({
          ...baseSpaceship.getState(),
          element: spaceshipGraphic,
        })
        return positionateSpaceship(USER_SPACESHIP_COORDINATES[i])(BOTTOM_RIGHT_ANGLE)(newSpaceship)
      })
    )
    if (isNothing(spaceships)) {
      return player
    }
    return player.assignState({ spaceships })
  }

  const setupEnemy = player => {
    const spaceships = player.getProp('spaceships').map(
      spaceships => spaceships.map((spaceship, i) => {
        const spaceshipGraphic = SpaceshipGraphic(spaceship)
        addChild(spaceshipGraphic)(graphic)
        const newSpaceship = spaceship.assignState({
          ...baseSpaceship.getState(),
          element: spaceshipGraphic,
        })
        return positionateSpaceship(ENEMY_SPACESHIP_COORDINATES[i])(TOP_LEFT_ANGLE)(newSpaceship)
      })
    )
    if (isNothing(spaceships)) {
      return player
    }
    return player.assignState({ spaceships })
  }
 
  newRound(
    Engine({
      players: [setupUser(user), setupEnemy(enemy)],
      onSelectSpaceship: onSelectSpaceship(graphic),
      onSetDestination: onSetDestination(graphic),
      onSetTarget: onSetTarget(graphic),
      background,
      readyBtnId,
      onStartUpdate: onStartUpdate(graphic),
      onUpdate,
      onGameEnd,
      onNewRound,
    })
  )
}
