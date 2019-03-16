import { compose } from '_utils/functions/base'
import { setPivot, spriteFromImage, setAnchor, setScale, setPosition, rotate, removeChild } from '_web/graphic'

import { either, Maybe, isNothing } from '_utils/functions/maybe';
import { newAnimation } from '_web/graphic';


const mapMaybe = fn => maybe => maybe.map(fn)
const flip = fn => x => y => fn(y)(x)
const getProp = prop => element => element.getProp ? element.getProp(prop) : Maybe(element[prop])
const cEither = other => maybe => either(maybe, other)
const ifExists = fn => instance => !isNothing(Maybe(instance)) ? fn(instance) : null 

const positionateElement = element => compose(
  cEither(element),
  mapMaybe(flip(setPosition)(element)),
  getProp('coordinate')
)
const rotateElement = element => compose(
  cEither(element),
  mapMaybe(flip(rotate)(element)),
  getProp('rotation')
)

const setScaleProps = compose(
  setScale(0.1, 0.1),
  setPivot(0.5, 0.5),
  setAnchor(0.5, 0.5)
)

const createStillSprite = spaceship =>
  compose(
    cEither(null),
    mapMaybe(spriteFromImage),
    mapMaybe(getProp('still')),
    getProp('sprites')
  )(spaceship)

export const Spaceship = spaceship =>
  compose(
    flip(positionateElement)(spaceship),
    flip(rotateElement)(spaceship),
    setScaleProps,
    createStillSprite
  )(spaceship)

const createMovingAnimation = spaceship =>
  compose(
    frames => newAnimation(frames, 0.5),
    images => images.map(PIXI.Texture.fromImage),
    cEither([]),
    mapMaybe(getProp('moving')),
    getProp('sprites')
  )(spaceship)

export const MovingSpaceship = spaceship => 
  compose(
    flip(positionateElement)(spaceship),
    flip(rotateElement)(spaceship),
    setScaleProps,
    createMovingAnimation,
  )(spaceship)


const onComplete = graphic => anim => () => removeChild(graphic)(anim)

const createExplodingAnimation = graphic => spaceship =>
  compose(
    frames => newAnimation(frames, 0.5, false, onComplete(graphic)),
    images => images.map(PIXI.Texture.fromImage),
    cEither([]),
    mapMaybe(getProp('explosion')),
    getProp('sprites')
  )(spaceship)


export const ExplodingSpaceship = graphic => spaceship => 
  compose(
    flip(positionateElement)(spaceship),
    flip(rotateElement)(spaceship),
    setScaleProps,
    createExplodingAnimation(graphic),
  )(spaceship)
