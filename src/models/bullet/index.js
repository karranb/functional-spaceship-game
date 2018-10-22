import { modelFunctions, assignState } from '_utils/functions/model'
import { getVelFactor } from '_utils/functions/spatial'
import { X_AXIS, Y_AXIS, BULLET_SPEED, BULLET_SIZE } from '_utils/constants'
import { mapMaybes } from '_utils/functions/maybe'
import { compose } from '_utils/functions/base';
import { getPropsAndMap } from '../../utils/functions/maybe';

const Bullet = state => {
  if (state.velX && state.velY) {
    return {
      ...modelFunctions(Bullet)(state)
    }
  }

  const calcVel = (destination, coordinate) => {
    const curriedVelFactor = getVelFactor(coordinate, destination)
    const velX = curriedVelFactor(X_AXIS) * BULLET_SPEED
    const velY = curriedVelFactor(Y_AXIS) * BULLET_SPEED
    return assignState(Bullet)(state)({
      size: BULLET_SIZE,
      ...state,
      velX,
      velY,
    })      
  }
  return compose(
    props => mapMaybes(...props)(calcVel).flatten(),
    getProps(state)
  )('destination', 'coordinate')
}

export default Bullet
