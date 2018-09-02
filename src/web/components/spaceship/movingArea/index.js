import Size from '_models/size'
import { compose, map } from '_utils/base'
import { newGraphic, setPivot, drawCircle, setAlpha, setPosition } from '_web/graphic'
import { flip } from '_utils/helper'
import { fEither } from '_utils/logic'
import { div, mult } from '_utils/math'
import { getProp } from '_utils/model'
import { MOVING_AREA_FACTOR } from '_utils/constants'

const getScale = spaceship =>
  compose(
    fEither(0),
    map(flip(div)(MOVING_AREA_FACTOR)),
    getProp('reach')
  )(spaceship)

const setAreaPivot = graphic => setPivot(0.5, 0.5)(graphic)

const setAreaPosition = spaceship => graphic =>
  compose(
    fEither(graphic),
    map(flip(setPosition)(graphic)),
    getProp('coordinate')
  )(spaceship)

const calcAreaSize = spaceship => spaceshipSize =>
  compose(
    scale => Size(mult(spaceshipSize.w(), scale), mult(spaceshipSize.h(), scale)),
    getScale
  )(spaceship)

const drawMovingArea = spaceship => size =>
  compose(
    setAlpha(0.3),
    setAreaPosition(spaceship),
    setAreaPivot,
    drawCircle(0xffffff, size),
    newGraphic
  )()

const getSpaceshipSizeAndDraw = spaceship =>
  compose(
    map(drawMovingArea(spaceship)),
    map(calcAreaSize(spaceship)),
    getProp('size')
  )(spaceship)

const MovingArea = spaceship =>
  compose(
    fEither(newGraphic()),
    getSpaceshipSizeAndDraw
  )(spaceship)

export default MovingArea
