// import * as PIXI from 'pixi.js'

// import Element from '_utils/functions/element'
import Coordinate from '_utils/coordinate'
// import Size from '_utils/size'
import {
  // getCoordinate,
  getSize,
} from '_utils/functions/spatial'
import {
  // checkOutBounds,
  checkCollision,
  checkCollisionSquareCircle,
} from '_utils/functions/helper'

import { anyCompose } from '_utils/functions/base'

import Bullet from './index'


const functions = state => ({
  draw: () => {
    const { el } = state
    el.beginFill(0x0b0b5d)
    el.drawCircle(
      0,
      0,
      state.size.w(),
      state.size.h(),
    )
    el.endFill()
    return Bullet({ ...state })
  },
  update: () => {
    const {
      coordinate,
      velX,
      velY,
      el,
    } = state

    const x = coordinate.x() - velX
    const y = coordinate.y() - velY

    const newPosition = Coordinate(x, y)

    el.x = x
    el.y = y
    
    return Bullet({
      ...state,
      el,
      coordinate: newPosition,
    })
  },
  getSize: () => getSize(state),
  checkCollisions: spaceships => {
    const curriedCheckCollisionWithSpaceship = spaceship => () =>
      checkCollisionSquareCircle(spaceship)(Bullet({ ...state }))

    const checkCollisionWithBullet = bullet =>
      checkCollision(Bullet({ ...state }), bullet)

    const curriedCheckCollisionWithSpaceshipBullets = spaceship => () =>
      spaceship.getState().bullets.some(checkCollisionWithBullet)

    const anyCollision = spaceship => anyCompose(
      curriedCheckCollisionWithSpaceship(spaceship),
      curriedCheckCollisionWithSpaceshipBullets(spaceship),
    )

    return spaceships.some(anyCollision)
  },
})

export default functions
