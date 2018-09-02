import * as PIXI from 'pixi.js'

import { X_AXIS, Y_AXIS } from '_utils/constants'
import Element from '_utils/functions/element'
import Size from '_utils/size'
import { getCoordinate, getVelFactor } from '_utils/functions/spatial'


import functions from './functions'

const Bullet = (config = {}) => {
  const el = config.el || new PIXI.Graphics()
  const { destination, coordinate } = config

  const curriedVelFactor = getVelFactor(coordinate, destination)
  const velX = config.velX || curriedVelFactor(X_AXIS) * 4
  const velY = config.velY || curriedVelFactor(Y_AXIS) * 4
  const state = {
    ...config,
    el,
    velX,
    velY,
    size: Size(7, 7),
  }
  return {
    ...Element(state),
    ...functions(state),
    getCoordinate: () => getCoordinate(state),
  }
}

export default Bullet
