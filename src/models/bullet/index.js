import modelFunctions from '_utils/functions/model'
import { getVelFactor } from '_utils/functions/spatial'
import { X_AXIS, Y_AXIS, BULLET_SPEED, BULLET_SIZE } from '_utils/constants'

const Bullet = state => {
  if (state.velX && state.velY) {
    return {
      ...modelFunctions({
        ...state,
        size: BULLET_SIZE,
      }),
    }
  }
  const { destination, coordinate } = state
  const curriedVelFactor = getVelFactor(coordinate, destination)
  const velX = curriedVelFactor(X_AXIS) * BULLET_SPEED
  const velY = curriedVelFactor(Y_AXIS) * BULLET_SPEED
  const newState = {
    size: BULLET_SIZE,
    ...state,
    velX,
    velY,
  }
  return {
    ...modelFunctions(newState),
  }
}

export default Bullet
