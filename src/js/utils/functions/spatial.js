import Coordinate from '_utils/coordinate'
import { X_AXIS, Y_AXIS } from '_utils/constants'

export const getCoordinate = state => state.coordinate

export const getDestination = state => state.destination

export const newCoordinate = (_state, coordinate) => {
  const state = {
    ..._state,
    coordinate,
  }
  state.el.x = coordinate.x()
  state.el.y = coordinate.y()
  return state
}

export const newDestination = (state, coordinate) => ({
  ...state,
  destination: coordinate,
})

export const getSize = state => state.size

export const getRotation = state => state.rotation

export const areEqualCoordinates = (coordinate1, coordinate2) =>
  (coordinate1.x() === coordinate2.x() && coordinate1.y() === coordinate2.y())

export const getDistance = (coordinate1, coordinate2) => {
  const dX = Math.abs(coordinate1.x() - coordinate2.x())
  const dY = Math.abs(coordinate1.y() - coordinate2.y())
  return Math.sqrt((dX ** 2) + (dY ** 2))
}

export const getVelFactor = (coordinate1, coordinate2) => {
  const dist = getDistance(coordinate1, coordinate2)
  return axis => {
    const tAxis = coordinate1[axis]() - coordinate2[axis]()
    return tAxis / dist
  }
}

export const getAngle = (coordinate1, coordinate2) => {
  const dy = coordinate1.y() - coordinate2.y()
  const dx = coordinate1.x() - coordinate2.x()
  return Math.atan2(dy, dx)
}


export const move = (coordinate, destination) => {
  if (!destination) {
    return () => Coordinate(coordinate.x(), coordinate.y())
  }
  return vel => {
    const curriedVelFactor = getVelFactor(coordinate, destination)
    const velX = curriedVelFactor(X_AXIS) * vel
    const velY = curriedVelFactor(Y_AXIS) * vel

    const x = Math.abs((coordinate.x() - velX) - destination.x()) > vel ? (coordinate.x() - velX) : destination.x()
    const y = Math.abs((coordinate.y() - velY) - destination.y()) > vel ? (coordinate.y() - velY) : destination.y()
    return Coordinate(x, y) 
  }
}
