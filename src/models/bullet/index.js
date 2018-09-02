import { getObjPropsAndMap, getObjProps, modelFunctions } from '_utils/model'
import { always, flip } from '_utils/helper'
import { areSome } from '_utils/maybe/functions'
import { compose, hashedFns } from '_utils/base'

import { calcVel } from './functions'

const safeCalcAndSetVel = state =>
  getObjPropsAndMap(state)('coordinate', 'destination')(calcVel(state))

const cSafeCalcAndSetVel = state => () => safeCalcAndSetVel(state)

const fGetProps = flip(getObjProps)

const Bullet = state =>
  compose(
    maybes =>
      hashedFns({
        true: always({ ...modelFunctions(Bullet)(state) }),
        false: cSafeCalcAndSetVel(state),
      })(areSome(maybes)),
    fGetProps('velX', 'velY')
  )(state)

export default Bullet
