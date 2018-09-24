import targetCursor from '_assets/images/target-cursor.png'
import { setPosition, spriteFromImage } from '_web/graphic'
import Coordinate from '_models/coordinate'
import { compose } from '_utils/functions/base'

const targetSize = 32

const Target = spaceship => {
  const { targetCoordinate } = spaceship.getState()
  return compose(
    setPosition(
      Coordinate(targetCoordinate.x() - targetSize / 2, targetCoordinate.y() - targetSize / 2)
    ),
    spriteFromImage
  )(targetCursor)
}

export default Target
