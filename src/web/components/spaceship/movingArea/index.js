import Size from '_models/size'
import { compose } from '_utils/functions/base'
import { newElement, setPivot, drawCircle, setAlpha, setPosition } from '_web/graphic'

const MovingArea = spaceship => {
  const { size, speed, coordinate } = spaceship.getState()
  const scale = speed / 300
  return compose(
    setPosition(coordinate),
    drawCircle(0xffffff, Size(size.w() * scale, size.h() * scale)),
    setAlpha(0.3),
    setPivot(size.w() / 2, size.h() / 2),
    newElement
  )()
}

export default MovingArea
