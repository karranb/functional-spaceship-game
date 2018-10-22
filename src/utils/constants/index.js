import { degreesToRadians } from '_utils/functions/helper'
import Size from '_models/size'
import Coordinate from '_models/coordinate'
import Spaceship from '_models/spaceship'

export const GAME_SIZE = Size(800, 500)
export const MAX_ROUNDS = 15

export const SPACESHIP_COLLISION_DAMAGE = 20

export const SPACESHIP_TYPES = {
  spaceship1: Spaceship({
    shield: 400,
    speed: 1200,
    size: Size(44.7, 32.9),
  }),
  spaceship2: Spaceship({
    shield: 700,
    speed: 900,
    size: Size(44.7, 32.9),
  }),
  spaceship3: Spaceship({
    shield: 800,
    speed: 800,
    size: Size(44.7, 32.9),
  }),
  spaceship4: Spaceship({
    shield: 1000,
    speed: 600,
    size: Size(44.7, 32.9),
  }),
  spaceship5: Spaceship({
    shield: 1200,
    speed: 400,
    size: Size(44.7, 32.9),
  }),
}

export const BULLET_SPEED = 4
export const BULLET_SIZE = Size(7, 7)

export const X_AXIS = 'x'
export const Y_AXIS = 'y'

export const BLUE = 0x0000ff
export const BOTTOM_RIGHT_ANGLE = degreesToRadians(45)
export const YELLOW = 0xffff00
export const TOP_LEFT_ANGLE = degreesToRadians(225)

export const USER_SPACESHIP_COORDINATES = [
  Coordinate(50, 50),
  Coordinate(120, 50),
  Coordinate(50, 120),
]

export const ENEMY_SPACESHIP_COORDINATES = [
  Coordinate(GAME_SIZE.w() - 50, GAME_SIZE.h() - 50),
  Coordinate(GAME_SIZE.w() - 120, GAME_SIZE.h() - 50),
  Coordinate(GAME_SIZE.w() - 50, GAME_SIZE.h() - 120),
]
