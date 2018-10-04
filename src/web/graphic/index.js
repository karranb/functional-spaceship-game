import * as PIXI from 'pixi.js'

import modelFunctions from '_utils/functions/model'
import { getById } from '_utils/functions/helper'

export const Graphic = config => ({
  ...modelFunctions(config),
})

export const setAnchor = (x, y) => element => {
  element.anchor.x = x
  element.anchor.y = y
  return element
}

export const lineTo = coordinate => element => {
  element.lineTo(coordinate.x(), coordinate.y())
  return element
}

export const moveTo = coordinate => element => {
  element.moveTo(coordinate.x(), coordinate.y())
  return element
}

export const setLineStyle = (size, color) => element => {
  element.lineStyle(size, color)
  return element
}

export const setPosition = coordinate => element => {
  if (!coordinate) return element
  element.position.x = coordinate.x()
  element.position.y = coordinate.y()
  return element
}

export const setAlpha = alpha => element => {
  element.alpha = alpha
  return element
}

export const drawRect = (color, size) => element => {
  element.beginFill(color)
  element.drawRect(0, 0, size.w(), size.h())
  element.endFill()
  return element
}

export const drawCircle = (color, size) => element => {
  element.beginFill(color)
  element.drawCircle(0, 0, size.w(), size.h())
  element.endFill()
  return element
}

export const setPivot = (x, y) => element => {
  element.pivot.x = x
  element.pivot.y = y
  return element
}

export const newElement = () => new PIXI.Graphics()

export const setScale = (x, y) => element => {
  element.scale.x = x
  element.scale.y = y
  return element
}

export const setupGameView = (gameSize, div) => {
  PIXI.utils.skipHello()
  const app = new PIXI.Application(gameSize.w(), gameSize.h(), {
    antialias: true,
  })
  div.appendChild(app.renderer.view)
  return Graphic({
    app,
    div,
  })
}

export const addChild = element => graphic => {
  const state = graphic.getState()
  state.app.stage.addChild(element)
  return Graphic({ ...state })
}

export const removeChild = element => graphic => {
  const state = graphic.getState()
  state.app.stage.removeChild(element)
  return Graphic({ ...state })
}

export const attachCursor = graphic => {
  const state = graphic.getState()
  return Graphic({
    ...state,
  })
}

export const dettachCursor = graphic => {
  const state = graphic.getState()
  return Graphic({
    ...state,
  })
}

export const spriteFromImage = image => PIXI.Sprite.fromImage(image)

export const rotate = rad => element => {
  if (!rad) return element
  element.rotation = rad
  return element
}

export const removeDOMOnClick = id => {
  const oldElement = getById(id)
  const clonedElement = oldElement.cloneNode(true)
  oldElement.parentNode.replaceChild(clonedElement, oldElement)
  return clonedElement
}

export const addDOMOnClick = fn => id => {
  const clonedElement = removeDOMOnClick(id)
  clonedElement.addEventListener('click', fn)
  return clonedElement
}

export const removeOnClick = element => {
  element.interactive = false
  element.buttonMode = false
  element.off('pointerdown')
  return element
}

export const addOnClick = fn => element => {
  removeOnClick(element)
  element.interactive = true
  element.buttonMode = true
  element.on('pointerdown', fn)
  return element
}

export const newTicker = () => {
  const ticker = new PIXI.ticker.Ticker()
  ticker.autoStart = false
  ticker.stop()
  return ticker
}
