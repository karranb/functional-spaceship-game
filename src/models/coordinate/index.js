import { getAngle, getDistance, areEqualCoordinates } from '_utils/functions/spatial'

const Coordinate = (x, y) => ({
  x: () => x,
  y: () => y,
  equals: coordinate => areEqualCoordinates(Coordinate(x, y), coordinate),
  distance: coordinate => getDistance(Coordinate(x, y), coordinate),
  angle: coordinate => getAngle(Coordinate(x, y), coordinate),
})

export default Coordinate
