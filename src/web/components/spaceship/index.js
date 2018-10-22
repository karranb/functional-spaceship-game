import { compose } from '_utils/functions/base'
import { setPivot, spriteFromImage, setAnchor, setScale, setPosition, rotate, removeChild } from '_web/graphic'
import still from '_assets/images/spaceship/blue/blue-still.png'

import moving1 from '_assets/images/spaceship/blue/moving/moving1.png'
import moving2 from '_assets/images/spaceship/blue/moving/moving2.png'
import moving3 from '_assets/images/spaceship/blue/moving/moving3.png'
import moving4 from '_assets/images/spaceship/blue/moving/moving4.png'
import moving5 from '_assets/images/spaceship/blue/moving/moving5.png'
import moving6 from '_assets/images/spaceship/blue/moving/moving6.png'
import moving7 from '_assets/images/spaceship/blue/moving/moving7.png'
import moving8 from '_assets/images/spaceship/blue/moving/moving8.png'


import explosion1 from '_assets/images/spaceship/blue/explosion/explosion1.png'
import explosion2 from '_assets/images/spaceship/blue/explosion/explosion2.png'
import explosion3 from '_assets/images/spaceship/blue/explosion/explosion3.png'
import explosion4 from '_assets/images/spaceship/blue/explosion/explosion4.png'
import explosion5 from '_assets/images/spaceship/blue/explosion/explosion5.png'
import explosion6 from '_assets/images/spaceship/blue/explosion/explosion6.png'
import explosion7 from '_assets/images/spaceship/blue/explosion/explosion7.png'
import explosion8 from '_assets/images/spaceship/blue/explosion/explosion8.png'
import explosion9 from '_assets/images/spaceship/blue/explosion/explosion9.png'
import explosion10 from '_assets/images/spaceship/blue/explosion/explosion10.png'
import explosion11 from '_assets/images/spaceship/blue/explosion/explosion11.png'
import explosion12 from '_assets/images/spaceship/blue/explosion/explosion12.png'
import explosion13 from '_assets/images/spaceship/blue/explosion/explosion13.png'
import explosion14 from '_assets/images/spaceship/blue/explosion/explosion14.png'
import explosion15 from '_assets/images/spaceship/blue/explosion/explosion15.png'
import explosion16 from '_assets/images/spaceship/blue/explosion/explosion16.png'


import { getPropsAndMap , either } from '_utils/functions/maybe';
import { newAnimation } from '_web/graphic';


export const Spaceship = spaceship => {
  const element = compose(
    setScale(0.1, 0.1),
    setPivot(0.5, 0.5),
    setAnchor(0.5, 0.5),
    spriteFromImage,
  )(still)
  const positionatedElement = getPropsAndMap(spaceship)(
    (coordinate, rotation) => 
      compose(
          rotate(rotation),
          setPosition(coordinate),
        )(element) 
    )('coordinate', 'rotation')
  console.log(positionatedElement, element)
  return either(positionatedElement, element)
}


export const MovingSpaceship = spaceship => {
  const frames = [
    moving1,
    moving2,
    moving3,
    moving4,
    moving5,
    moving6,
    moving7,
    moving8,
  ].map(PIXI.Texture.fromImage)
  animation(frames, speed)
  const anim = newAnimation(frames, 0.5)
  return compose(
    result => either(result, anim),
    getPropsAndMap(spaceship)((rotation, coordinate) => compose(
      rotate(rotation),
      setPosition(coordinate),
      setScale(0.1, 0.1),
      setPivot(0.5, 0.5),
      setAnchor(0.5, 0.5),
    )(anim))('coordinate', 'rotation')
  )()
}

export const ExplodingSpaceship = spaceship => graphic => {
  const frames = [
    explosion1,
    explosion2,
    explosion3,
    explosion4,
    explosion5,
    explosion6,
    explosion7,
    explosion8,
    explosion9,
    explosion10,
    explosion11,
    explosion12,
    explosion13,
    explosion14,
    explosion15,
    explosion16,
  ].map(PIXI.Texture.fromImage)
  const onComplete = () => removeChild(anim)(graphic)
  const anim = newAnimation(frames, 0.5, loop = false, onComplete)
  return compose(
    result => either(result, anim),
    getPropsAndMap(spaceship)((coordinate, rotation) => compose(
      rotate(rotation),
      setPosition(coordinate),
      setScale(0.5, 0.5),
      setPivot(0.5, 0.5),
      setAnchor(0.5, 0.5),
    )(anim))('coordinate', 'rotation')
  )()
}
