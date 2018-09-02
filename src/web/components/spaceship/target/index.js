import targetCursor from '_assets/images/target-cursor.png'
import { setPosition, spriteFromImage } from '_web/graphic'
import Coordinate from '_models/coordinate'
import { compose, map } from '_utils/base'
import { flip } from '_utils/helper'
import { div, sub } from '_utils/math'
import { fEither } from '_utils/logic'
import { getProp } from '_utils/model'

const targetSize = 32
const halfTargetSize = div(targetSize, 2)

const calcCoordinate = coordinate =>
  Coordinate(sub(coordinate.x(), halfTargetSize), sub(coordinate.y(), halfTargetSize))

const setTargetPosition = coordinate =>
  compose(
    flip(setPosition)(spriteFromImage(targetCursor)),
    calcCoordinate
  )(coordinate)

const Target = spaceship =>
  compose(
    fEither(null),
    map(setTargetPosition),
    getProp('targetCoordinate')
  )(spaceship)

export default Target
