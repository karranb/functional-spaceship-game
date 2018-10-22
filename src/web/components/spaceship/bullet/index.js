import { compose } from '_utils/functions/base'
import { newElement, drawCircle, setPosition } from '_web/graphic'
import { mapMaybes } from '_utils/functions/maybe';
import { getPropsAndMap } from '../../../../utils/functions/maybe';

export const Bullet = bullet => {
  const bulletColor = 0x0b0b5d
  return compose(
    result => either(result, newElement),
    getPropsAndMap(bullet)((size, coordinate) => compose(
        setPosition(coordinate),
        drawCircle(bulletColor, size),
        newElement
      )
    )('size', 'coordinate')
  )()
}
