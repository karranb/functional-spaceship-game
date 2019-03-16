import Size from '_models/size'
import { compose } from '_utils/functions/base'
import { newElement, setPivot, drawCircle, setAlpha, setPosition } from '_web/graphic'
import { either } from '_utils/functions/maybe'

const mapMaybe = fn => maybe => maybe.map(fn)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp(prop)
const cEither = other => maybe => either(maybe, other)

const getScale = spaceship => compose(
  cEither(0),
  mapMaybe(speed => speed / 300), 
  getProp('speed')
)(spaceship)

const setAreaPivot = element => setPivot(.5, .5)(element)

const setAreaPosition = spaceship => element =>
  compose(
    cEither(element),
    mapMaybe(flip(setPosition)(element)),
    getProp('coordinate')
  )(spaceship)

const calcAreaSize = spaceship => spaceshipSize => compose(
  scale => Size(spaceshipSize.w() * scale, spaceshipSize.h() * scale),
  getScale,
)(spaceship)

const drawMovingArea = spaceship => size => compose(
  setAlpha(0.3),
  setAreaPosition(spaceship),
  setAreaPivot,
  drawCircle(0xffffff, size),
  newElement
)()

const getSpaceshipSizeAndDraw = spaceship => compose(
  mapMaybe(drawMovingArea(spaceship)),
  mapMaybe(calcAreaSize(spaceship)),
  getProp('size')
)(spaceship)

const MovingArea = spaceship => 
  compose(
    cEither(newElement()),
    getSpaceshipSizeAndDraw
  )(spaceship)

export default MovingArea
