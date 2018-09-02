import { compose, map, hashedFns } from '_utils/base'
import { newGraphic, drawCircle, setPosition } from '_web/graphic'
import { flip } from '_utils/helper'
import { getProp } from '_utils/model'
import { fEither, not } from '_utils/logic'

const bulletColor = 0x0b0b5d

const setBulletPosition = bullet => graphic =>
  compose(
    fEither(graphic),
    map(flip(setPosition)(graphic)),
    getProp('coordinate')
  )(bullet)

const drawBulletCircle = size =>
  compose(
    drawCircle(bulletColor, size),
    newGraphic
  )()

const createBullet = bullet =>
  compose(
    fEither(newGraphic()),
    map(drawBulletCircle),
    getProp('size')
  )(bullet)

export const Bullet = bullet =>
  hashedFns({ true: () => setBulletPosition(bullet), false: () => createBullet(bullet) })(
    not(bullet)
  )
