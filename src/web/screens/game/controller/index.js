import { addOnClick, removeOnClick, addDOMOnClick } from '_web/graphic'
import { startUpdate, getUser, selectSpaceship } from '_models/engine/functions'
import { flip, always } from '_utils/helper'
import { getById } from '_utils/dom'
import { fEither } from '_utils/logic'
import { getProp } from '_utils/model'
import { compose, map } from '_utils/base'

import { onTargetSelect, onMovingAreaSelect } from '../listeners'

const setButtonDisabled = disabled => id => {
  getById(id).disabled = disabled
}

export const deactivateReadyBtn = engine =>
  compose(
    always(engine),
    map(setButtonDisabled(true)),
    getProp('readyBtnId')
  )(engine)

const enableReadyAndAddListener = engine => readyFn => readyBtnId =>
  compose(
    always(engine.assignState({ readyFn })),
    always(addDOMOnClick(readyFn)(readyBtnId)),
    setButtonDisabled(false)
  )(readyBtnId)

const readyFn = engine => () => startUpdate(engine)

export const activateReadyBtn = engine =>
  compose(
    fEither(engine),
    map(enableReadyAndAddListener(engine)(readyFn(engine))),
    getProp('readyBtnId')
  )(engine)

const removeSpaceshipsOnClick = spaceships =>
  spaceships.forEach(spaceship => spaceship.getProp('graphic').map(removeOnClick))

export const deactivateSpaceshipsSelection = engine =>
  compose(
    always(engine),
    map(removeSpaceshipsOnClick),
    getProp('spaceships'),
    getUser
  )(engine)

const addSpaceshipsOnClick = spaceship => engine => graphic =>
  compose(
    flip(addOnClick)(graphic),
    () => () => selectSpaceship(spaceship)(engine)
  )()

const addMaybeSpaceshipsOnClick = engine => spaceship =>
  compose(
    map(addSpaceshipsOnClick(spaceship)(engine)),
    getProp('graphic')
  )(spaceship)

export const activateSpaceshipsSelection = engine =>
  compose(
    always(engine),
    map(spaceships => map(addMaybeSpaceshipsOnClick(engine), spaceships)),
    getProp('spaceships'),
    getUser
  )(engine)

const cOnMovingAreaSelect = graphicController => engine => e =>
  onMovingAreaSelect(e)(graphicController)(engine)

export const activateMovingAreaSelection = movingArea => graphicController => engine =>
  compose(
    always(engine),
    flip(addOnClick)(movingArea),
    cOnMovingAreaSelect(graphicController)
  )(engine)

export const deactivateTargetSelection = engine =>
  compose(
    always(engine),
    map(removeOnClick),
    getProp('background')
  )(engine)

export const activateTargetSelection = graphicController => engine =>
  compose(
    always(engine),
    map(addOnClick(onTargetSelect(graphicController, engine))),
    getProp('background')
  )(engine)
