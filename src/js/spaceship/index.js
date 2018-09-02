import * as PIXI from 'pixi.js'

import { SPACE_SHIP_SIZES } from '_utils/constants'
import elementFunctions from '_utils/functions/element'
import {
  spaceshipSpatialFunctions,
  isSelected,
  draw,
  select,
  processCollisions,
  disselect,
  update,
  rotate,
} from './functions'


const Spaceship = config => {
  const state = {
    el: config.el || new PIXI.Graphics(),
    size: SPACE_SHIP_SIZES,
    bullets: (config.bullets && config.bullets.length) ? config.bullets : [],
    ...config,
  }
  return {
    ...elementFunctions(state),
    ...spaceshipSpatialFunctions(state),
    draw: () => draw(state),
    update: () => update(state),
    select: () => select(state),
    disselect: () => disselect(state),
    isSelected: () => isSelected(state),
    rotate: rad => rotate(state, rad),
    drawBullet: () => Spaceship({
      ...state,
      bullets: state.bullets.map(bullet => bullet.draw()),
    }),
  }
}

export default Spaceship
