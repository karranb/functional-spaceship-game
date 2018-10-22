import Size from '_models/size'
import { compose } from '_utils/functions/base'
import { newElement, setPivot, drawCircle, setAlpha, setPosition } from '_web/graphic'
import { mapMaybes, getPropsAndMap, either } from '../../../../utils/functions/maybe';

const MovingArea = spaceship =>
  compose(
    result => either(result, newElement),
    getPropsAndMap(spaceship)((size, speed, coordinate) => {
      const scale = speed / 300
      return compose(
        setPosition(coordinate),
        drawCircle(0xffffff, Size(size.w() * scale, size.h() * scale)),
        setAlpha(0.3),
        setPivot(size.w() / 2, size.h() / 2),
        newElement
      )})('size', 'speed', 'coordinate')
  )()

export default MovingArea
