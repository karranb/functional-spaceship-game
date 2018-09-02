import * as PIXI from 'pixi.js'

import elementFunctions from '_utils/functions/element'

import draw from './functions'

const Path = (config = {}) => {
  const el = config.el || new PIXI.Graphics()
  const state = {
    ...config,
    el,
  }
  return {
    ...elementFunctions(state),
    draw: draw(state),
  }
}

export default Path
