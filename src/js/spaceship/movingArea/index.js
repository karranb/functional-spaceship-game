import * as PIXI from 'pixi.js'

import Element from '../../utils/functions/element'
import draw from './functions'

const MovingArea = (config = {}) => {
  const el = config.el || new PIXI.Graphics()
  const state = {
    ...config,
    el,
  }
  return {
    ...Element(state),
    draw: draw(state),
  }
}

export default MovingArea
