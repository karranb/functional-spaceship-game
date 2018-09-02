/* eslint-disable no-param-reassign */

import * as PIXI from 'pixi.js'

import { modelFunctions } from '_utils/model'
import { getById } from '_utils/dom'
import { curry } from '_utils/base'

export const Graphic = config => ({ ...modelFunctions(Graphic)(config) })

export const setAnchor = (x, y) => graphic => {
  graphic.anchor.x = x
  graphic.anchor.y = y
  return graphic
}

export const lineTo = coordinate => graphic => {
  graphic.lineTo(coordinate.x(), coordinate.y())
  return graphic
}

export const moveTo = coordinate => graphic => {
  graphic.moveTo(coordinate.x(), coordinate.y())
  return graphic
}

export const setLineStyle = (size, color) => graphic => {
  graphic.lineStyle(size, color)
  return graphic
}

export const setPosition = curry((coordinate, graphic) => {
  if (!coordinate) return graphic
  graphic.position.x = coordinate.x()
  graphic.position.y = coordinate.y()
  return graphic
})

export const setAlpha = alpha => graphic => {
  graphic.alpha = alpha
  return graphic
}

export const drawRect = (color, size) => graphic => {
  graphic.beginFill(color)
  graphic.drawRect(0, 0, size.w(), size.h())
  graphic.endFill()
  return graphic
}

export const drawCircle = (color, size) => graphic => {
  graphic.beginFill(color)
  graphic.drawCircle(0, 0, size.w(), size.h())
  graphic.endFill()
  return graphic
}

export const setPivot = (x, y) => graphic => {
  graphic.pivot.x = x
  graphic.pivot.y = y
  return graphic
}

export const newGraphic = () => new PIXI.Graphics()

export const newAnimation = (frames, speed, loop, onComplete) => {
  const anim = new PIXI.extras.AnimatedSprite(frames)
  anim.animationSpeed = speed
  if (onComplete) {
    anim.onComplete = onComplete(anim)
  }
  if (loop === false) {
    anim.loop = loop !== false
  }
  anim.play()
  return anim
}

export const setScale = (x, y) => graphic => {
  graphic.scale.x = x
  graphic.scale.y = y
  return graphic
}

export const setupGameView = (gameSize, div) => {
  PIXI.utils.skipHello()
  const app = new PIXI.Application(gameSize.w(), gameSize.h(), {
    antialias: true,
  })
  div.appendChild(app.renderer.view)
  return Graphic({ app, div })
}

export const addChild = graphicController => graphic => {
  graphicController.getProp('app').map(app => app.stage.addChild(graphic))
  return graphic
}

export const removeChild = graphicController => graphic => {
  graphicController.getProp('app').map(app => app.stage.removeChild(graphic))
  return graphic
}

export const attachCursor = graphicController => graphicController

export const dettachCursor = graphicController => graphicController

export const spriteFromImage = image => PIXI.Sprite.fromImage(image)

export const textureFromImage = image => PIXI.Texture.fromImage(image)

export const rotate = curry((rad, graphic) => {
  if (!rad) return graphic
  graphic.rotation = rad
  return graphic
})

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

export const removeOnClick = graphic => {
  graphic.interactive = false
  graphic.buttonMode = false
  graphic.off('pointerdown')
  return graphic
}

export const addOnClick = fn => graphic => {
  removeOnClick(graphic)
  graphic.interactive = true
  graphic.buttonMode = true
  graphic.on('pointerdown', fn)
  return graphic
}

export const newTicker = () => {
  const ticker = new PIXI.ticker.Ticker()
  ticker.autoStart = false
  ticker.stop()
  return ticker
}
