import { modelFunctions, assignState, getProps } from "_utils/functions/model"
import { getVelFactor } from "_utils/functions/spatial"
import { X_AXIS, Y_AXIS, BULLET_SPEED, BULLET_SIZE } from "_utils/constants"
import { getPropsAndMap, Maybe } from "_utils/functions/maybe"
import { compose } from "../../utils/functions/base"

const ifElse = (cond, onTrue, onFalse) => (...args) => cond(...args) ? onTrue() : onFalse()
const not = statement => !statement
const every = args => statement =>  args.every(statement);
const isNothing = value => Maybe(value).isNothing()

const curriedIsNothing = () => maybe => isNothing(maybe)
const notFn = fn => compose(not, fn)
const areSome = maybes => compose(
  every(maybes),
  notFn,
  curriedIsNothing
)()

const calcVel = state => (coordinate, destination) =>
  compose(
    getAxisFactor => assignState(Bullet)(state)({
      size: BULLET_SIZE,
      velX: getAxisFactor(X_AXIS) * BULLET_SPEED,
      velY: getAxisFactor(Y_AXIS) * BULLET_SPEED,
    }),
    () => getVelFactor(coordinate, destination)
  )

const safeCalcAndSetVel = state =>  () => compose(
  getPropsAndMap(state)("coordinate", "destination")(calcVel(state))
)(state)
  

const flippedGetProps = (...names) => object =>
  names.map(name => Maybe(object[name]))

const Bullet = state => 
  compose(
    ifElse(
      areSome,
      () => ({...modelFunctions(Bullet)(state)}),
      safeCalcAndSetVel(state)
    ),
    flippedGetProps('velX', 'velY')
  )(state)


// const Bullet = state => {
//   if (state.velX && state.velY) {
//     return {
//       ...modelFunctions(Bullet)(state)
//     }
//   }

//   const calcVel = (destination, coordinate) => {
//     const curriedVelFactor = getVelFactor(coordinate, destination)
//     const velX = curriedVelFactor(X_AXIS) * BULLET_SPEED
//     const velY = curriedVelFactor(Y_AXIS) * BULLET_SPEED
//     return assignState(Bullet)(state)({
//       size: BULLET_SIZE,
//       ...state,
//       velX,
//       velY,
//     })
//   }
//   return getPropsAndMap(state)('destination', 'coordinate')(calcVel)
// }

export default Bullet;
