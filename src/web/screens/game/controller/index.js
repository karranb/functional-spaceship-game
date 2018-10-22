import { addOnClick, removeOnClick, addDOMOnClick } from '_web/graphic'
import Engine from '_models/engine'
import { startUpdate, getUser } from '_models/engine/functions'
import { getById } from '_utils/functions/helper'

import { onTargetSelect, onMovingAreaSelect, onSpaceshipSelect } from '../listeners'

export const deactivateReadyBtn = engine => 
  engine.getProp('readyBtnId').map(
    readyBtnId => {
      getById(readyBtnId).disabled = true
      return engine
    }
  )


export const activateReadyBtn = engine =>
  engine.getProp('readyBtnId').map(
    readyBtnId => {
      getById(readyBtnId).disabled = false
      const readyFn = () => startUpdate(engine)
      const newEngine = engine.assignState({ readyFn })
      addDOMOnClick(readyFn)(readyBtnId)
      return newEngine
    }
  )

export const deactivateSpaceshipsSelection = engine => {
  const user = getUser(engine)
  user.getProp('spaceships').map(spaceships => spaceships.forEach(
    spaceship => spaceship.getProp('element').map(removeOnClick)
  ))
  return engine
}

export const activateSpaceshipsSelection = engine => {
  const user = getUser(engine)
  user.getProp('spaceships').map(spaceships => spaceships.forEach(
    spaceship => {
      const cSelectSpaceshipFn = () => onSpaceshipSelect(spaceship)(engine)
      spaceship.getProp('element').map(addOnClick(cSelectSpaceshipFn))
    }
  ))
  return engine
}

export const activateMovingAreaSelection = movingArea => engine => {
  const onClick = e => onMovingAreaSelect(e)(engine)
  addOnClick(onClick)(movingArea)
  return engine
}

export const deactivateTargetSelection = engine => {
  engine.getProp('background').map(removeOnClick)
  return engine
}

export const activateTargetSelection = engine => {
  const onSelect = e => onTargetSelect(e)(engine)
  engine.getProp('background').map(addOnClick(onSelect))
  return engine
}
