import Coordinate from '_models/coordinate'
import { degreesToRadians } from '_utils/functions/helper'
import { getDistance, getVelFactor, move } from '_utils/functions/spatial'
import { X_AXIS, Y_AXIS } from '_utils/constants'
import { newElement, lineTo, moveTo, setLineStyle, setPosition } from '_web/graphic'
import { compose } from '_utils/functions/base'
import { mapMaybes, getPropsAndMap, either } from '_utils/functions/maybe'


const drawX = spaceship => element =>
  compose(
    result => either(result, element),
    () => spaceship.getPropsAndMap('coordinate', 'destination')((coordinate, destination) => {
      const xCenter = destination.x()
      const yCenter = destination.y()
      const size = 10
      const angles = [45, 225, 135, 315]
      moveTo(Coordinate(xCenter, yCenter))
      angles.forEach(angle => {
        compose(
          lineTo(
            Coordinate(
              xCenter - size * Math.cos(degreesToRadians(angle)),
              yCenter - size * Math.sin(degreesToRadians(angle))
            )
          ),
          moveTo(destination)
        )(element)
      })
      return element
    })
  )()


const drawDashLine = element =>(destination, coordinate) => {
  let currentPosition = coordinate
  moveTo(coordinate)(element)
  const cMove = move(coordinate, destination)
  const dash = 16
  const gap = 8
  for (
    ;
    currentPosition.x() !== destination.x() ||
    currentPosition.y() !== destination.y();
  ) {
    currentPosition = cMove(dash, currentPosition, true)
    lineTo(currentPosition)(element)
    currentPosition = cMove(gap, currentPosition)
    moveTo(currentPosition)(element)
  }
  return element
}

const lineSize = 3
const lineColor = 0xffffff

const Path = spaceship =>
  compose(
    drawX(spaceship),
    element => spaceship.getPropsAndMap('destination', 'coordinate')(drawDashLine(element)),
    setLineStyle(lineSize, lineColor),
    newElement
  )()

export default Path
