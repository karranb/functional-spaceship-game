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

// const rotateCorners = (corner, angleSin, angleCos, coordinate) => [
//   add(coordinate.x(), sub(mult(corner[0], angleCos), mult(corner[1], angleSin))),
//   add(coordinate.y(), add(mult(corner[0], angleSin), mult(corner[1], angleCos))),
// ]

const changeSignal = x => mult(x, -1)

const createCorners = (halfWidth, halfHeight) => [
  [halfWidth, halfHeight],
  [halfWidth, changeSignal(halfHeight)],
  [changeSignal(halfWidth), halfHeight],
  [changeSignal(halfWidth), changeSignal(halfHeight)],
]

// const createCornersRotateFn = (p, coord) =>
//   compose(
//     angle => corner => rotateCorners(corner, Math.sin(angle), Math.cos(angle), coord),
//     getRotation
//   )(p)

const rotateCorners = (corner, angleSin, angleCos, cx, cy) => [
  add(cx, sub(mult(corner[0], angleCos), mult(corner[1], angleSin))),
  add(cy, add(mult(corner[0], angleSin), mult(corner[1], angleCos))),
]

// const getPolygonCorners = p =>
//   p.getPropsAndMap('size', 'coordinate')((size, coordinate) =>
//     compose(
//       map(createCornersRotateFn(p, coordinate)),
//       () => createCorners(div(size.h(), 2), div(size.w(), 2))
//     )()
//   )

const getPolygonCorners = (px, py, pw, ph, pr) =>
  map(
    corner => rotateCorners(corner, Math.sin(pr), Math.cos(pr), px, py),
    createCorners(pw / 2, ph / 2)
  )

// {

// }

const polygonCornersReducer = (corners, polygon) => [...corners, getPolygonCorners(polygon)]

const cornersToLinesReducer = (polygonsLines, corners) =>
  compose(
    polygonLines => [...polygonsLines, polygonLines],
    map((line, i) => [line, getModItem(corners, i)])
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
        // console.log(1, l1LinePoints)
        // debugger
        return lines2.some(l2 => checkPointsCollisions(l1LinePoints, getLinePoints(l2)))
      })
    ),
    // _ => {
    //   console.log(0, _)
    //   return _
    // },
    reduce(cornersToLinesReducer)([]),
    // reduce(polygonCornersReducer)([])
    () => [getPolygonCorners(p1X, p1Y, p1W, p1H, p1R), getPolygonCorners(p2X, p2Y, p2W, p2H, p2R)]
    // _ => {
    //   console.log(
    //     'x', _[0].getState().coordinate.x(),
    //     'y', _[0].getState().coordinate.y(),
    //     'w', _[0].getState().size.w(),
    //     'h', _[0].getState().size.h(),
    //     'r', getRotation(_[0])
    //   )
    // }
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

export const checkCollisionBetweenPolygonsWrapper = (p1, p2, fn) =>
  p1.getPropsAndMap('coordinate', 'size')((p1Coordinate, p1Size) =>
    p2.getPropsAndMap('coordinate', 'size')(
      (p2Coordinate, p2Size) =>
        !!fn(
          p1Coordinate.x(),
          p1Coordinate.y(),
          p1Size.w(),
          p1Size.h(),
          getRotation(p1),
          p2Coordinate.x(),
          p2Coordinate.y(),
          p2Size.w(),
          p2Size.h(),
          getRotation(p2)
        )
    )
  )

export const checkCollisionSquareCircleWrapper = (square, circle, fn) =>
  square.getPropsAndMap('coordinate', 'size')((squareCoordinate, squareSize) =>
    circle.getPropsAndMap('coordinate', 'size')(
      (circleCoordinate, circleSize) =>
        !!fn(
          circleCoordinate.x(),
          circleCoordinate.y(),
          circleSize.w(),
          squareCoordinate.x(),
          squareCoordinate.y(),
          squareSize.w(),
          squareSize.h(),
          getRotation(square)
        )
    )
  )

export const checkCollisionSquareCircle = (
  cx,
  cy,
  cw,
  squareCenterX,
  squareCenterY,
  squareSizeW,
  squareSizeH,
  squareRotation
) => {
  const squareX = squareCenterX - squareSizeW / 2
  const squareY = squareCenterY - squareSizeH / 2

  const unrotatedCircleX =
    Math.cos(squareRotation) * (cx - squareCenterX) -
    Math.sin(squareRotation) * (cy - squareCenterY) +
    squareCenterX

  const unrotatedCircleY =
    Math.sin(squareRotation) * (cx - squareCenterX) +
    Math.cos(squareRotation) * (cy - squareCenterY) +
    squareCenterY

  const closestX = getClosestPoint(unrotatedCircleX, squareX, squareSizeW)
  const closestY = getClosestPoint(unrotatedCircleY, squareY, squareSizeH)

  const distance = getDistance(
    Coordinate(unrotatedCircleX, unrotatedCircleY),
    Coordinate(closestX, closestY)
  )
  return distance < cw / 2
}
