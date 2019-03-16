import { compose } from '_utils/functions/base'
import { newElement, drawCircle, setPosition } from '_web/graphic'
import { either } from '_utils/functions/maybe';

const mapMaybe = fn => maybe => maybe.map(fn)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp(prop)
const cEither = other => maybe => either(maybe, other)

const bulletColor = 0x0b0b5d

const setBulletPosition = bullet => element =>
  compose(
    cEither(element),
    mapMaybe(flip(setPosition)(element)),
    getProp('coordinate')
  )(bullet)

const drawBulletCircle = size => compose(
  drawCircle(bulletColor, size),
  newElement
)()

const createBullet = bullet => compose(
  cEither(newElement()),
  mapMaybe(drawBulletCircle),
  getProp('size')
)(bullet)

export const Bullet = bullet =>
  !bullet ? null : compose(
    setBulletPosition(bullet),
    createBullet
  )(bullet)
