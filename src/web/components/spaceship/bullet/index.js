import { compose } from '_utils/functions/base'
import { newElement, drawCircle, setPosition } from '_web/graphic'

export const Bullet = bullet => {
  const bulletColor = 0x0b0b5d
  const { size, coordinate } = bullet.getState()
  return compose(
    setPosition(coordinate),
    drawCircle(bulletColor, size),
    newElement
  )()
}
