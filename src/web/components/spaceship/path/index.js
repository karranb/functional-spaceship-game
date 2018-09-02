import Coordinate from '_models/coordinate'
import { degreesToRadians } from '_utils/math'
import { either } from '_utils/logic'
import { move } from '_utils/spatial'
import { newGraphic, lineTo, moveTo, setLineStyle } from '_web/graphic'
import { compose } from '_utils/base'

const drawX = spaceship => graphic =>
  compose(
    result => either(result, graphic),
    () =>
      spaceship.getPropsAndMap('coordinate', 'destination')((coordinate, destination) => {
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
          )(graphic)
        })
        return graphic
      })
  )()

const drawDashLine = graphic => (destination, coordinate) => {
  let currentPosition = coordinate
  moveTo(coordinate)(graphic)
  const cMove = move(coordinate, destination)
  const dash = 16
  const gap = 8
  for (; currentPosition.x() !== destination.x() || currentPosition.y() !== destination.y(); ) {
    currentPosition = cMove(dash, currentPosition, true)
    lineTo(currentPosition)(graphic)
    currentPosition = cMove(gap, currentPosition)
    moveTo(currentPosition)(graphic)
  }
  return graphic
}

const lineSize = 3
const lineColor = 0xffffff

const Path = spaceship =>
  compose(
    drawX(spaceship),
    graphic => spaceship.getPropsAndMap('destination', 'coordinate')(drawDashLine(graphic)),
    setLineStyle(lineSize, lineColor),
    newGraphic
  )()

export default Path
