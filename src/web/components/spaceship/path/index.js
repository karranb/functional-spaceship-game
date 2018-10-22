import Coordinate from '_models/coordinate'
import { degreesToRadians } from '_utils/functions/helper'
import { getDistance, getVelFactor } from '_utils/functions/spatial'
import { X_AXIS, Y_AXIS } from '_utils/constants'
import { newElement, lineTo, moveTo, setLineStyle, setPosition } from '_web/graphic'
import { compose } from '_utils/functions/base'
import { mapMaybes, getPropsAndMap } from '_utils/functions/maybe';


const drawX = spaceship => element =>
  compose(
    result => either(result, element),
    getPropsAndMap(spaceship)((coordinate, destination) => {
      const xCenter = destination.x() - coordinate.x()
      const yCenter = destination.y() - coordinate.y()
      const size = 10
      const angles = [45, 225, 135, 315]
      angles.forEach(angle => {
        compose(
          lineTo(
            Coordinate(
              xCenter - size * Math.cos(degreesToRadians(angle)),
              yCenter - size * Math.sin(degreesToRadians(angle))
            )
          ),
          moveTo(Coordinate(xCenter, yCenter))
        )(element)
      })
      return element
    })('coordinate', 'destination')
  )()

const curriedDrawPath = spaceship => element =>
  getPropsAndMap(spaceship)((coordinate, destination, size) => {
    const curriedVelFactor = getVelFactor(coordinate, destination)
    const velX = curriedVelFactor(X_AXIS) * 5
    const velY = curriedVelFactor(Y_AXIS) * 5
    const drawPath = position => (lastPosition = null, shouldDraw = true) => {
      if (position.equals(destination)) {
        return element
      }
      // if too close of destination, new positions is destination
      const newX = Math.abs(position.x() + velX - destination.x()) < 1 ? destination.x() : position.x() - velX
      const newY = Math.abs(position.y() + velY - destination.y()) < 1 ? destination.y() : position.y() - velY
      const drawPathAtPosition = drawPath(newX, newY)
      const isOverSpaceship =
        Math.abs(x - coordinate.x()) < size.w() / 2 && Math.abs(y - coordinate.y()) < size.h() / 2
      if (isOverSpaceship) {
        return drawPathAtPosition(null, shouldDraw)
      }
      // if didnt start line, start line
      if (!lastPosition) {
        return drawPathAtPosition(position, shouldDraw)
      }
      const distance = getDistance(position, destination)
      if (distance > 5) {
        const lineStartX = lastPosition.x() - coordinate.x()
        const lineStartY = lastPosition.y() - coordinate.y()
        moveTo(Coordinate(lineStartX, lineStartY))(element)
        if (shouldDraw) {
          lineTo(Coordinate(position.x() - coordinate.x(), position.y() - coordinate.y()))(element)
        }
        return drawPathAtPosition(null, !shouldDraw)
      }
      return drawPathAtPosition(lastPosition, shouldDraw)
    }
    return drawPath(coordinate)()
  })('coordinate', 'destination', 'size')


const setStart = spaceship => element => {
  const lineSize = 3
  const lineColor = 0xffffff
  return spaceship.getProp('coordinate').map(coordinate =>
    compose(
      moveTo(coordinate),
      setPosition(coordinate),
      setLineStyle(lineSize, lineColor)
    )(element)
  )
}

const Path = spaceship =>
  compose(
    drawX(spaceship),
    curriedDrawPath(spaceship),
    setStart(spaceship),
    newElement
  )()

export default Path
