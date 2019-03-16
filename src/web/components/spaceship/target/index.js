import targetCursor from '_assets/images/target-cursor.png'
import { setPosition, spriteFromImage } from '_web/graphic'
import Coordinate from '_models/coordinate'
import { compose } from '_utils/functions/base'
import { either } from '_utils/functions/maybe';

const targetSize = 32

const mapMaybe = fn => maybe => maybe.map(fn)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp(prop)
const cEither = other => maybe => either(maybe, other)

const calcCoordinate = coordinate => Coordinate(coordinate.x() - targetSize / 2, coordinate.y() - targetSize / 2)

const setTargetPosition = coordinate =>
  compose(
    flip(setPosition)(spriteFromImage(targetCursor)),
    calcCoordinate
  )(coordinate)

const Target = spaceship => 
  compose(
    cEither(null),
    mapMaybe(setTargetPosition),
    getProp('targetCoordinate')
  )(spaceship)

export default Target
