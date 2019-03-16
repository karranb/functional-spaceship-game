import { degreesToRadians } from '_utils/functions/helper'
import Size from '_models/size'
import Coordinate from '_models/coordinate'
import Spaceship from '_models/spaceship'

import still from '_assets/images/spaceship/blue/blue-still.png'

import moving1 from '_assets/images/spaceship/blue/moving/moving1.png'
import moving2 from '_assets/images/spaceship/blue/moving/moving2.png'
import moving3 from '_assets/images/spaceship/blue/moving/moving3.png'
import moving4 from '_assets/images/spaceship/blue/moving/moving4.png'
import moving5 from '_assets/images/spaceship/blue/moving/moving5.png'
import moving6 from '_assets/images/spaceship/blue/moving/moving6.png'
import moving7 from '_assets/images/spaceship/blue/moving/moving7.png'
import moving8 from '_assets/images/spaceship/blue/moving/moving8.png'


import explosion1 from '_assets/images/spaceship/blue/explosion/explosion1.png'
import explosion2 from '_assets/images/spaceship/blue/explosion/explosion2.png'
import explosion3 from '_assets/images/spaceship/blue/explosion/explosion3.png'
import explosion4 from '_assets/images/spaceship/blue/explosion/explosion4.png'
import explosion5 from '_assets/images/spaceship/blue/explosion/explosion5.png'
import explosion6 from '_assets/images/spaceship/blue/explosion/explosion6.png'
import explosion7 from '_assets/images/spaceship/blue/explosion/explosion7.png'
import explosion8 from '_assets/images/spaceship/blue/explosion/explosion8.png'
import explosion9 from '_assets/images/spaceship/blue/explosion/explosion9.png'
import explosion10 from '_assets/images/spaceship/blue/explosion/explosion10.png'
import explosion11 from '_assets/images/spaceship/blue/explosion/explosion11.png'
import explosion12 from '_assets/images/spaceship/blue/explosion/explosion12.png'
import explosion13 from '_assets/images/spaceship/blue/explosion/explosion13.png'
import explosion14 from '_assets/images/spaceship/blue/explosion/explosion14.png'
import explosion15 from '_assets/images/spaceship/blue/explosion/explosion15.png'
import explosion16 from '_assets/images/spaceship/blue/explosion/explosion16.png'


export const GAME_SIZE = Size(800, 500)
export const MAX_ROUNDS = 15

export const SPACESHIP_COLLISION_DAMAGE = 20

const sprites = {
  still,
  moving: [
    moving1,
    moving2,
    moving3,
    moving4,
    moving5,
    moving6,
    moving7,
    moving8,
  ],
  explosion: [
    explosion1,
    explosion2,
    explosion3,
    explosion4,
    explosion5,
    explosion6,
    explosion7,
    explosion8,
    explosion9,
    explosion10,
    explosion11,
    explosion12,
    explosion13,
    explosion14,
    explosion15,
    explosion16,
  ]
}



export const SPACESHIP_TYPES = {
  spaceship1: Spaceship({
    shield: 400,
    speed: 1200,
    size: Size(44.7, 32.9),
    sprites,
  }),
  spaceship2: Spaceship({
    shield: 700,
    speed: 900,
    size: Size(44.7, 32.9),
    sprites,
  }),
  spaceship3: Spaceship({
    shield: 800,
    speed: 800,
    size: Size(44.7, 32.9),
    sprites,
  }),
  spaceship4: Spaceship({
    shield: 1000,
    speed: 600,
    size: Size(44.7, 32.9),
    sprites,
  }),
  spaceship5: Spaceship({
    shield: 1200,
    speed: 400,
    size: Size(44.7, 32.9),
    sprites,
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
