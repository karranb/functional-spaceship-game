import { compose, map } from '_utils/base'
import {
  setPivot,
  spriteFromImage,
  setAnchor,
  setScale,
  setPosition,
  rotate,
  removeChild,
  newAnimation,
  textureFromImage,
} from '_web/graphic'
import { flip } from '_utils/helper'
import { fEither } from '_utils/logic'
import { getProp, getObjProp } from '_utils/model'

const positionateGraphic = graphic =>
  compose(
    fEither(graphic),
    map(flip(setPosition)(graphic)),
    getProp('coordinate')
  )
const rotateGraphic = graphic =>
  compose(
    fEither(graphic),
    map(flip(rotate)(graphic)),
    getProp('rotation')
  )

const setScaleProps = compose(
  setScale(0.1, 0.1),
  setPivot(0.5, 0.5),
  setAnchor(0.5, 0.5)
)

const createStillSprite = spaceship =>
  compose(
    fEither(null),
    map(spriteFromImage),
    map(getObjProp('still')),
    getProp('sprites')
  )(spaceship)

export const Spaceship = spaceship =>
  compose(
    flip(positionateGraphic)(spaceship),
    flip(rotateGraphic)(spaceship),
    setScaleProps,
    createStillSprite
  )(spaceship)

const createMovingAnimation = spaceship =>
  compose(
    frames => newAnimation(frames, 0.5),
    images => images.map(textureFromImage),
    fEither([]),
    map(getObjProp('moving')),
    getProp('sprites')
  )(spaceship)

export const MovingSpaceship = spaceship =>
  compose(
    flip(positionateGraphic)(spaceship),
    flip(rotateGraphic)(spaceship),
    setScaleProps,
    createMovingAnimation
  )(spaceship)

const onComplete = graphicController => anim => () => removeChild(graphicController)(anim)

const createExplodingAnimation = graphicController => spaceship =>
  compose(
    frames => newAnimation(frames, 0.5, false, onComplete(graphicController)),
    images => images.map(textureFromImage),
    fEither([]),
    map(getObjProp('explosion')),
    getProp('sprites')
  )(spaceship)

export const ExplodingSpaceship = graphicController => spaceship =>
  compose(
    flip(positionateGraphic)(spaceship),
    flip(rotateGraphic)(spaceship),
    setScaleProps,
    createExplodingAnimation(graphicController)
  )(spaceship)
