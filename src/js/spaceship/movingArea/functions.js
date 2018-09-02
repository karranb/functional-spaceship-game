import { SPACE_SHIP_SIZES } from '_utils/constants'
import MovingArea from './index'

const draw = state => () => {
  const { el } = state
  el.beginFill(0xffffff)
  el.drawCircle(
    state.coordinate.x(),
    state.coordinate.y(),
    SPACE_SHIP_SIZES.w() * 4,
    SPACE_SHIP_SIZES.h() * 4,
  )
  el.endFill()
  el.alpha = 0.3
  return MovingArea({ ...state })
}

export default draw
