import { SPACESHIP_SIZES } from '_utils/constants'
import { emptyFn } from '_utils/functions/base'
import modelFunctions from '_utils/functions/model'

const Spaceship = ({
  size = SPACESHIP_SIZES,
  bullets = [],
  onSetCoordinate = emptyFn,
  onRotate = emptyFn,
  ...state
}) => ({
  ...modelFunctions({
    ...state,
    size,
    bullets,
    onSetCoordinate,
    onRotate,
  }),
})

export default Spaceship
