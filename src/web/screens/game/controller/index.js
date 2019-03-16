import { addOnClick, removeOnClick, addDOMOnClick } from '_web/graphic'
import Engine from '_models/engine'
import { startUpdate, getUser } from '_models/engine/functions'
import { getById } from '_utils/functions/helper'
import { compose, map } from '_utils/functions/base'

import { either, Maybe, isNothing } from '_utils/functions/maybe'

import { onTargetSelect, onMovingAreaSelect, onSpaceshipSelect } from '../listeners'

const mapMaybe = fn => maybe => map(maybe, fn) 
const assignState = state => element => element.assignState(state)
const flip = fn => x => y => fn(y)(x)
// const getProp = prop => element => element.getProp(prop)
const getProp = prop => element => element.getProp ? element.getProp(prop) : Maybe(element[prop])

const cEither = other => maybe => either(maybe, other)
const always = x => () => x


export const deactivateReadyBtn = engine => compose(
  always(engine),
  mapMaybe(readyBtnId => getById(readyBtnId).disabled = true),
  getProp('readyBtnId')
)(engine) 

const enableReadyAndAddListener = engine => readyFn => readyBtnId => compose(
  always(engine.assignState({ readyFn })),
  always(addDOMOnClick(readyFn)(readyBtnId)),
  readyBtnId => getById(readyBtnId).disabled = false,
)(readyBtnId)

const readyFn = engine => () => startUpdate(engine)

export const activateReadyBtn = engine =>
  compose(
    cEither(engine),
    mapMaybe(enableReadyAndAddListener(engine)(readyFn(engine))),
    getProp('readyBtnId')
  )(engine)

const removeSpaceshipsOnClick = spaceships => spaceships.forEach(
  spaceship => spaceship.getProp('element').map(removeOnClick)
)

export const deactivateSpaceshipsSelection = engine => 
  compose(
    always(engine),
    mapMaybe(removeSpaceshipsOnClick),
    getProp('spaceships'),
    getUser
  )(engine)

const addSpaceshipsOnClick = spaceship => engine => element => compose(
  flip(addOnClick)(element),
  () => () => onSpaceshipSelect(spaceship)(engine)
)()

const addMaybeSpaceshipsOnClick = engine => spaceship => compose(
  mapMaybe(addSpaceshipsOnClick(spaceship)(engine)),
  getProp('element')
)(spaceship)

export const activateSpaceshipsSelection = engine => compose(
  always(engine),
  mapMaybe(spaceships =>  map(spaceships, addMaybeSpaceshipsOnClick(engine))),
  getProp('spaceships'),
  getUser,
)(engine)

const cOnMovingAreaSelect = graphic => engine => e => onMovingAreaSelect(e)(graphic)(engine)


export const activateMovingAreaSelection = movingArea => graphic => engine => 
  compose(
    always(engine),
    flip(addOnClick)(movingArea),
    cOnMovingAreaSelect(graphic)
  )(engine)

export const deactivateTargetSelection = engine => compose(
  always(engine),
  mapMaybe(removeOnClick),
  getProp('background')
)(engine)


export const activateTargetSelection = graphic => engine =>
  compose(
    always(engine),
    mapMaybe(addOnClick(onTargetSelect(graphic)(engine))),
    getProp('background')
  )(engine)
