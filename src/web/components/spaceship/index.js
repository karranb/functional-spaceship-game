import { compose } from '_utils/functions/base'
import { setPivot, spriteFromImage, setAnchor, setScale } from '_web/graphic'

export const Spaceship = img =>{
  console.log(img)
  return compose(
    setScale(0.1, 0.1),
    setPivot(0.5, 0.5),
    setAnchor(0.5, 0.5),
    spriteFromImage
  )(img)
}
