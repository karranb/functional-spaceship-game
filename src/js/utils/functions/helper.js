/* global document */

import { GAME_SIZE } from '_utils/constants'
import { getDistance } from '_utils/functions/spatial'
import Coordinate from '_utils/coordinate'

export const getById = id => document.getElementById(id)

export const degreesToRadians = degrees => degrees * (Math.PI / 180)

export const checkOutBounds = el => (el.getCoordinate().x() + el.getSize().w()) < 0 ||
  (el.getCoordinate().x() - el.getSize().w()) > GAME_SIZE.w() ||
    (el.getCoordinate().y() + el.getSize().h()) < 0 ||
      (el.getCoordinate().y() - el.getSize().h()) > GAME_SIZE.h()

export const checkCollision = (el, otherEl) => {
  const elCoordinate = el.getCoordinate()
  const otherElCoordinate = otherEl.getCoordinate()
  const elSize = el.getSize()
  const otherElSize = otherEl.getSize()
  return (elCoordinate.x() + (elSize.w() / 2)) > (otherElCoordinate.x() - (otherElSize.w() / 2)) &&
    (elCoordinate.x() - (elSize.w() / 2)) < (otherElCoordinate.x() + (otherElSize.w() / 2)) &&
    (elCoordinate.y() + (elSize.h() / 2)) > (otherElCoordinate.y() - (otherElSize.h() / 2)) &&
    (elCoordinate.y() - (elSize.h() / 2)) < (otherElCoordinate.y() + (otherElSize.h() / 2))
}

const getClosestPoint = (unrotatedBulletPoint, spaceshipPoint, spaceshipSize) => {
  if (unrotatedBulletPoint < spaceshipPoint) {
    return spaceshipPoint
  }
  if (unrotatedBulletPoint > (spaceshipPoint + spaceshipSize)) {
    return spaceshipPoint + spaceshipSize
  }
  return unrotatedBulletPoint
}
const rotateCorners = (corner, angleSin, angleCos, coordinate) => {
  const cornerX = coordinate.x() +
    ((corner[0] * angleCos) -
    (corner[1] * angleSin))
  const cornerY = coordinate.y() +
    ((corner[0] * angleSin) +
    (corner[1] * angleCos))
  return [cornerX, cornerY]
}
const getPolygonCorners = p => {
  const halfWidth = p.getSize().w() / 2
  const halfHeight = p.getSize().h() / 2
  const angle = p.getRotation()
  const angleSin = Math.sin(angle)
  const angleCos = Math.cos(angle)
  const coordinate = p.getCoordinate()
  const cRotateCorners = corner => rotateCorners(corner, angleSin, angleCos, coordinate)
  return [
    [halfWidth, halfHeight],
    [halfWidth, -halfHeight],
    [-halfWidth, halfHeight],
    [-halfWidth, -halfHeight],
  ].map(cRotateCorners)
}

const polygonCornersReducer = (corners, polygon) => [...corners, getPolygonCorners(polygon)]

const cornersToLinesReducer = (polygonsLines, corners) => {
  const polygonLines = corners.map((line, i) =>
    [
      line,
      corners[(i + 1) % corners.length],
    ])
  return [
    ...polygonsLines,
    polygonLines,
  ]
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
      const det = ((c - a) * (s - q)) - ((r - p) * (d - b))
      if (det === 0) {
        return false
      }
      const lambda = (((s - q) * (r - a)) + ((p - r) * (s - b))) / det
      const gamma = (((b - d) * (r - a)) + ((c - a) * (s - b))) / det
      return ((lambda > 0) && (lambda < 1)) && ((gamma > 0) && (gamma < 1))
    })
  })
}


export const checkCollisionSquareCircle = square => {
  const squareCoordinate = square.getCoordinate()
  const squareSize = square.getSize()
  const squareRotation = square.getRotation()

  const squareCenterX = squareCoordinate.x()
  const squareCenterY = squareCoordinate.y()

  const squareX = squareCenterX - (squareSize.w() / 2)
  const squareY = squareCenterY - (squareSize.h() / 2)
  return circle => {
    const circleCoordinate = circle.getCoordinate()
    const circleSize = circle.getSize()

    const unrotatedCircleX = Math.cos(squareRotation) * (circleCoordinate.x() - squareCenterX) - Math.sin(squareRotation) * (circleCoordinate.y() - squareCenterY) + squareCenterX
    const unrotatedCircleY = Math.sin(squareRotation) * (circleCoordinate.x() - squareCenterX) + Math.cos(squareRotation) * (circleCoordinate.y() - squareCenterY) + squareCenterY

    const closestX = getClosestPoint(unrotatedCircleX, squareX, squareSize.w())
    const closestY = getClosestPoint(unrotatedCircleY, squareY, squareSize.h())

    const distance = getDistance(
      Coordinate(unrotatedCircleX, unrotatedCircleY),
      Coordinate(closestX, closestY)
    )

    return (distance < (circleSize.w() / 2))
  }
}
