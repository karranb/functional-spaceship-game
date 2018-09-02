import * as PIXI from 'pixi.js'

import Canvas from './index'
import bg from '../../../assets/images/background.jpg'
import { getById } from '../utils/functions/helper'
import { GAME_SIZE } from '../utils/constants'
// import targetCursor from '../../../assets/images/target-cursor.png'


const canvasFunctions = state => ({
  start: () => {
    PIXI.utils.skipHello()
    const app = new PIXI.Application(
      GAME_SIZE.w(),
      GAME_SIZE.h(),
      { antialias: true },
    )
    app.renderer.view.style.maxWidth = '100%'
    app.renderer.view.style.maxHeight = '100%'
    app.renderer.backgroundColor = 0xCCCCCC

    const background = PIXI.Sprite.fromImage(bg)
    background.anchor.x = 0
    background.anchor.y = 0
    background.scale.x = 0.47
    background.scale.y = 0.47
    background.position.x = 0
    background.position.y = 0
    app.stage.addChild(background)
    const div = getById('game')
    div.appendChild(app.renderer.view)
    return Canvas({
      ...state,
      app,
      el: background,
      div,
    })
  },
  addChild: actor => {
    state.app.stage.addChild(actor.getEl())
  },
  removeChild: actor => {
    state.app.stage.removeChild(actor.getEl())
  },
  attachCursor: () => {
    const { div, el } = state
    // div.style.cursor = `url(${targetCursor}), pointer`
    div.style.cursor = 'pointer'
    el.buttonMode = false
  },
  dettachCursor: () => {
    const { div } = state
    div.style.cursor = 'inherit'
  },
})

export default canvasFunctions
