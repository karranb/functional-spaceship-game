import { compose } from '_utils/functions/base'
import Coordinate from '_models/coordinate'
import { spriteFromImage, setAnchor, setScale, setPosition } from '_web/graphic'
import bg from '_assets/images/background.jpg'

const Background = () =>
  compose(
    setPosition(Coordinate(0, 0)),
    setScale(2, 2),
    setAnchor(0, 0),
    spriteFromImage
  )(bg)

export default Background
