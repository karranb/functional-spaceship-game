import { getObjProps, modelFunctions } from '_utils/model'
import { always, flip } from '_utils/helper'
import { areSome } from '_utils/maybe/functions'
import { compose, hashedFns } from '_utils/base'

import { calcVel } from './functions'

const fGetProps = flip(getObjProps)

const Bullet = state =>
  compose(
    maybes =>
      hashedFns({
        true: always({ ...modelFunctions(Bullet, state) }),
        false: () => calcVel(state, Bullet),
      })(areSome(maybes)),
    fGetProps('velX', 'velY')
  )(state)

export default Bullet
