import * as PIXI from 'pixi.js'

import elementFunctions from '_utils/functions/element'
import targetCursor from '_assets/images/target-cursor.png'

import draw from './functions'

const Target = config => {
  const el = config.el || PIXI.Sprite.fromImage(targetCursor)
  const state = {
    ...config,
    el,
  }

  return {
    ...elementFunctions(state),
    draw: draw(state),
  }
}

export default Target
