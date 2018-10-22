import Coordinate from '_models/coordinate'
import Size from '_models/size'
import { X_AXIS, Y_AXIS, GAME_SIZE } from '_utils/constants'
import { mapMaybes, getPropsAndMap } from './maybe';

export const scaleSize = scale => size => Size(size.w() * scale, size.h() * scale)

export const getRotation = actor => either(actor.getProp('rotation'), 0)

export const areEqualCoordinates = (coordinate1, coordinate2) =>
  coordinate1.x() === coordinate2.x() && coordinate1.y() === coordinate2.y()

export const getDistance = (coordinate1, coordinate2) => {
  const dX = Math.abs(coordinate1.x() - coordinate2.x())
  const dY = Math.abs(coordinate1.y() - coordinate2.y())
  return Math.sqrt(dX ** 2 + dY ** 2)
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

    const x =
      Math.abs(coordinate.x() - velX - destination.x()) > vel
        ? coordinate.x() - velX
        : destination.x()
    const y =
      Math.abs(coordinate.y() - velY - destination.y()) > vel
        ? coordinate.y() - velY
        : destination.y()
    return Coordinate(x, y)
  }
}


export const checkOutBounds = el => 
  compose(
    result => either(result, true),
    getPropsAndMap(el)((coordinate, size) => {
      coordinate.x() + size.w() < 0 ||
      coordinate.x() - size.w() > GAME_SIZE.w() ||
      coordinate.y() + size.h() < 0 ||
      coordinate.y() - size.h() > GAME_SIZE.h()
    })('coordinate', 'size')
  )()

const getClosestPoint = (unrotatedBulletPoint, spaceshipPoint, spaceshipSize) => {
  if (unrotatedBulletPoint < spaceshipPoint) {
    return spaceshipPoint
  }
  if (unrotatedBulletPoint > spaceshipPoint + spaceshipSize) {
    return spaceshipPoint + spaceshipSize
  }
  return unrotatedBulletPoint
}
const rotateCorners = (corner, angleSin, angleCos, coordinate) => {
  const cornerX = coordinate.x() + (corner[0] * angleCos - corner[1] * angleSin)
  const cornerY = coordinate.y() + (corner[0] * angleSin + corner[1] * angleCos)
  return [cornerX, cornerY]
}
const getPolygonCorners = p =>
  getPropsAndMap(p)((size, coordinate) => {
    const halfWidth = size.w() / 2
    const halfHeight = size.h() / 2
    const angle = getRotation(p)
    const angleSin = Math.sin(angle)
    const angleCos = Math.cos(angle)
    const cRotateCorners = corner => rotateCorners(corner, angleSin, angleCos, coordinate)
    return [
      [halfWidth, halfHeight],
      [halfWidth, -halfHeight],
      [-halfWidth, halfHeight],
      [-halfWidth, -halfHeight],
    ].map(cRotateCorners)
  })('size', 'coordinate').flatten()

const polygonCornersReducer = (corners, polygon) => [...corners, getPolygonCorners(polygon)]

const cornersToLinesReducer = (polygonsLines, corners) => {
  const polygonLines = corners.map((line, i) => [line, corners[(i + 1) % corners.length]])
  return [...polygonsLines, polygonLines]
}

export const checkCollisionBetweenPolygons = (polygon1, polygon2) => {
  const polygonsCorners = [polygon1, polygon2].reduce(polygonCornersReducer, [])
  const [polygon1Lines, polygon2Lines] = polygonsCorners.reduce(cornersToLinesReducer, [])
  return polygon1Lines.some(line => {
    const [a, b] = line[0]
    const [c, d] = line[1]
    return polygon2Lines.some(comparedLine => {
      const [r, s] = comparedLine[0]
      const [p, q] = comparedLine[1]
      const det = (c - a) * (s - q) - (r - p) * (d - b)
      if (det === 0) {
        return false
      }
      const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
      const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
      return lambda > 0 && lambda < 1 && (gamma > 0 && gamma < 1)
    })
  })
}

export const checkCollisionSquareCircle = square => circle => 
  getPropsAndMap(square)((squareCoordinate, squareSize) => {
    const squareRotation = getRotation(square)
    
    const squareCenterX = squareCoordinate.x()
    const squareCenterY = squareCoordinate.y()
  
    const squareX = squareCenterX - squareSize.w() / 2
    const squareY = squareCenterY - squareSize.h() / 2

      getPropsAndMap(circle)((circleCoordinate, circleSize) => {
        const unrotatedCircleX =
          Math.cos(squareRotation) * (circleCoordinate.x() - squareCenterX) -
          Math.sin(squareRotation) * (circleCoordinate.y() - squareCenterY) +
          squareCenterX

        const unrotatedCircleY =
          Math.sin(squareRotation) * (circleCoordinate.x() - squareCenterX) +
          Math.cos(squareRotation) * (circleCoordinate.y() - squareCenterY) +
          squareCenterY

        const closestX = getClosestPoint(unrotatedCircleX, squareX, squareSize.w())
        const closestY = getClosestPoint(unrotatedCircleY, squareY, squareSize.h())
    
        const distance = getDistance(
          Coordinate(unrotatedCircleX, unrotatedCircleY),
          Coordinate(closestX, closestY)
        )
        return distance < circleSize.w() / 2
      })('coordinate', 'size').flatten()
  })('coordinate', 'size').flatten()
