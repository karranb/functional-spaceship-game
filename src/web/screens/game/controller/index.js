import { addOnClick, removeOnClick, addDOMOnClick } from '_web/graphic'
import Engine from '_models/engine'
import { startUpdate, getUser } from '_models/engine/functions'
import { getById } from '_utils/functions/helper'

import { onTargetSelect, onMovingAreaSelect, onSpaceshipSelect } from '../listeners'

export const deactivateReadyBtn = engine => {
  const { readyBtnId } = engine.getState()
  getById(readyBtnId).disabled = true
  return engine
}

export const activateReadyBtn = engine => {
  const state = engine.getState()
  const { readyBtnId } = state
  getById(readyBtnId).disabled = false
  const readyFn = () => startUpdate(engine)
  const newEngine = Engine({
    ...state,
    readyFn,
  })
  addDOMOnClick(readyFn)(readyBtnId)
  return newEngine
}

export const deactivateSpaceshipsSelection = engine => {
  const user = getUser(engine)

  user.getState().spaceships.forEach(spaceship => {
    removeOnClick(spaceship.getState().element)
  })
  return engine
}

export const activateSpaceshipsSelection = engine => {
  const user = getUser(engine)
  user.getState().spaceships.forEach(spaceship => {
    const cSelectSpaceshipFn = () => onSpaceshipSelect(spaceship)(engine)
    addOnClick(cSelectSpaceshipFn)(spaceship.getState().element)
  })
  return engine
}

export const activateMovingAreaSelection = movingArea => engine => {
  const onClick = e => onMovingAreaSelect(e)(engine)
  addOnClick(onClick)(movingArea)
  return engine
}

export const deactivateTargetSelection = engine => {
  const { background } = engine.getState()
  removeOnClick(background)
  return engine
}

export const activateTargetSelection = engine => {
  const state = engine.getState()
  const { background } = state
  const onSelect = e => onTargetSelect(e)(engine)
  addOnClick(onSelect)(background)
  return engine
}
