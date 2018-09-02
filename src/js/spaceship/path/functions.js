import Coordinate from '_utils/coordinate'

import { degreesToRadians } from '_utils/functions/helper'
import { getDistance, getVelFactor } from '_utils/functions/spatial'
import { SPACE_SHIP_SIZES, X_AXIS, Y_AXIS } from '_utils/constants'

import Path from './index'


const drawX = el => coordinate => destination => {
  const xCenter = destination.x() - coordinate.x()
  const yCenter = destination.y() - coordinate.y()
  const size = 10
  const angles = [45, 225, 135, 315]
  angles.forEach(angle => {
    el.moveTo(xCenter, yCenter)
    el.lineTo(
      xCenter - (size * Math.cos(degreesToRadians(angle))),
      yCenter - (size * Math.sin(degreesToRadians(angle))),
    )
  })
}

const curriedDrawPath = (coordinate, destination, el) => {
  const curriedVelFactor = getVelFactor(coordinate, destination)
  const velX = curriedVelFactor(X_AXIS) * 2
  const velY = curriedVelFactor(Y_AXIS) * 2

  const drawPath = (x = coordinate.x(), y = coordinate.y()) => (lastPosition = null, shouldDraw = true) => {
    const position = Coordinate(x, y)
    if (position.equals(destination)) {
      return null
    }
    // if too close of destination, new positions is destination
    const newX = Math.abs((x + velX) - destination.x()) < 1 ? destination.x() : (x - velX)
    const newY = Math.abs((y + velY) - destination.y()) < 1 ? destination.y() : (y - velY)
    const drawPathAtPosition = drawPath(newX, newY)

    const isOverSpaceship = (Math.abs(x - coordinate.x()) < SPACE_SHIP_SIZES.w() / 2) &&
               (Math.abs(y - coordinate.y()) < SPACE_SHIP_SIZES.h() / 2)

    // if over spaceship, dont start line
    if (isOverSpaceship) {
      return drawPathAtPosition(null, shouldDraw)
    }

    // if didnt start line, start line
    if (!lastPosition) {
      return drawPathAtPosition(Coordinate(x, y), shouldDraw)
    }

    const distance = getDistance(position, destination)
    if (distance > 5) {
      const lineStartX = lastPosition.x() - coordinate.x()
      const lineStartY = lastPosition.y() - coordinate.y()
      el.moveTo(lineStartX, lineStartY)
      if (shouldDraw) {
        el.lineTo(x - coordinate.x(), y - coordinate.y())
      }
      return drawPathAtPosition(null, !shouldDraw)
    }
    return drawPathAtPosition(lastPosition, shouldDraw)
  }

  return drawPath()
}


const setStart = el => coordinate => {
  const lineSize = 3
  const lineColor = 0xffffff
  el.position.set(coordinate.x(), coordinate.y())
  el.lineStyle(lineSize, lineColor)
  el.moveTo(coordinate.x(), coordinate.y())
}

const draw = state => () => {
  const { coordinate, destination, el } = state

  setStart(el)(coordinate)
  curriedDrawPath(coordinate, destination, el)()
  drawX(el)(coordinate)(destination)

  return Path({ ...state })
}

export default draw
 