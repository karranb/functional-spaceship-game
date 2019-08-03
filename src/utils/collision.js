import Coordinate from '_models/coordinate'

import { GAME_SIZE } from './constants'
import { compose, reduce, map, hashedFns } from './base'
import { and, eq, lt, gt, or, fEither } from './logic'
import { add, mult, sub, div } from './math'
import { getModItem } from './array'
import { always } from './helper'
import { getRotation, getDistance } from './spatial'

const isSumLtZero = (x, y) => lt(add(x, y), 0)

const isSubGt = (x, y, z) => gt(sub(x, y), z)

const isOutBounds = (coordinate, size) =>
  compose(
    or(isSubGt(coordinate.y(), size.h(), GAME_SIZE.h())),
    or(isSumLtZero(coordinate.y(), size.h())),
    or(isSubGt(coordinate.x(), size.w(), GAME_SIZE.w())),
    () => isSumLtZero(coordinate.x(), size.w())
  )()

export const checkOutBounds = el =>
  compose(
    fEither(true),
    () => el.getPropsAndMap('coordinate', 'size')(isOutBounds)
  )()

const changeSignal = x => mult(x, -1)

const createCorners = (halfWidth, halfHeight) => [
  [halfWidth, halfHeight],
  [halfWidth, changeSignal(halfHeight)],
  [changeSignal(halfWidth), halfHeight],
  [changeSignal(halfWidth), changeSignal(halfHeight)],
]

const rotateCorners = (corner, angleSin, angleCos, cx, cy) => [
  add(cx, sub(mult(corner[0], angleCos), mult(corner[1], angleSin))),
  add(cy, add(mult(corner[0], angleSin), mult(corner[1], angleCos))),
]
const getPolygonCorners = (px, py, pw, ph, pr) =>
  map(
    corner => rotateCorners(corner, Math.sin(pr), Math.cos(pr), px, py),
    createCorners(pw / 2, ph / 2)
  )

const cornersToLinesReducer = (polygonsLines, corners) =>
  compose(
    polygonLines => [...polygonsLines, polygonLines],
    map((line, i) => [line, getModItem(corners, i + 1)])
  )(corners)

const between01 = x => and(gt(x, 0), lt(x, 1))

const getLinePoints = line => [...line[0], ...line[1]]

const multDeltas = (x, y) => (w, z) => mult(sub(x, y), sub(w, z))

const getDet = (p1, p2) =>
  sub(multDeltas(p1[2], p1[0])(p2[1], p2[3]))(multDeltas(p2[0], p2[2])(p1[3], p1[1]))

const getLambda = (p1, p2) => det =>
  div(add(multDeltas(p2[1], p2[3])(p2[0], p1[0]))(multDeltas(p2[2], p2[0])(p2[1], p1[1])))(det)

const getGamma = (p1, p2) => det =>
  div(add(multDeltas(p1[1], p1[3])(p2[0], p1[0]))(multDeltas(p1[2], p1[0])(p2[1], p1[1])))(det)

const checkPointsCollisions = (p1, p2) =>
  compose(
    det =>
      hashedFns({
        true: () => false,
        false: () => and(between01(getLambda(p1, p2)(det)), between01(getGamma(p1, p2)(det))),
      })(eq(0, det)),
    () => getDet(p1, p2)
  )()

export const checkCollisionBetweenPolygons = (p1X, p1Y, p1W, p1H, p1R, p2X, p2Y, p2W, p2H, p2R) =>
  compose(
    compose(([lines1, lines2]) =>
      lines1.some(l1 => {
        const l1LinePoints = getLinePoints(l1)
        return lines2.some(l2 => checkPointsCollisions(l1LinePoints, getLinePoints(l2)))
      })
    ),
    reduce(cornersToLinesReducer)([]),
    () => [getPolygonCorners(p1X, p1Y, p1W, p1H, p1R), getPolygonCorners(p2X, p2Y, p2W, p2H, p2R)]
  )()

const getClosestPoint = (unrotatedBulletPoint, spaceshipPoint, spaceshipSize) =>
  hashedFns({
    true: always(spaceshipPoint),
    false: () =>
      hashedFns({
        true: () => add(spaceshipPoint, spaceshipSize),
        false: always(unrotatedBulletPoint),
      })(gt(unrotatedBulletPoint, add(spaceshipPoint, spaceshipSize))),
  })(lt(unrotatedBulletPoint, spaceshipPoint))

export const checkCollisionBetweenPolygonsWrapper = (p1, p2, fn) => {
  const p1State = p1.getState()
  const p2State = p2.getState()
  return !!fn(
    p1State.coordinate.x(),
    p1State.coordinate.y(),
    p1State.size.w(),
    p1State.size.h(),
    getRotation(p1),
    p2State.coordinate.x(),
    p2State.coordinate.y(),
    p2State.size.w(),
    p2State.size.h(),
    getRotation(p2)
  )
}

export const checkCollisionSquareCircleWrapper = (square, circle, fn) => {
  const squareState = square.getState()
  const circleState = circle.getState()
  return !!fn(
    circleState.coordinate.x(),
    circleState.coordinate.y(),
    circleState.size.w(),
    squareState.coordinate.x(),
    squareState.coordinate.y(),
    squareState.size.w(),
    squareState.size.h(),
    getRotation(square)
  )
}

const getUnrotatedCircleX = (squareRotation, circleX, circleY, squareX, squareY) =>
  add(
    sub(
      mult(Math.cos(squareRotation), sub(circleX, squareX)),
      mult(Math.sin(squareRotation), sub(circleY, squareY))
    ),
    squareX
  )

const getUnrotatedCircleY = (squareRotation, circleX, circleY, squareX, squareY) =>
  add(
    add(
      mult(Math.sin(squareRotation), sub(circleX, squareX)),
      mult(Math.cos(squareRotation), sub(circleY, squareY))
    ),
    squareY
  )

export const checkCollisionSquareCircle = (
  cx,
  cy,
  cw,
  squareX,
  squareY,
  squareSizeW,
  squareSizeH,
  squareRotation
) => {
  const squareCenterX = sub(squareX, div(squareSizeW, 2))
  const squareCenterY = sub(squareY, div(squareSizeH, 2))

  const unrotatedCircleX = getUnrotatedCircleX(squareRotation, cx, cy, squareX, squareY)
  const unrotatedCircleY = getUnrotatedCircleY(squareRotation, cx, cy, squareX, squareY)

  const closestX = getClosestPoint(unrotatedCircleX, squareCenterX, squareSizeW)
  const closestY = getClosestPoint(unrotatedCircleY, squareCenterY, squareSizeH)

  const distance = getDistance(
    Coordinate(unrotatedCircleX, unrotatedCircleY),
    Coordinate(closestX, closestY)
  )
  return lt(distance, div(cw, 2))
}
