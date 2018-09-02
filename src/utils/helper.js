import { map, compose, curry, hashedFns } from '_utils/base'
import Maybe from '_utils/maybe'
import { fEither } from '_utils/logic'
import { getProp } from '_utils/model'

export const flip = fn => (...x) => (...y) => fn(...y)(...x)

export const empty = () => {}

export const always = x => () => x

export const callListenerIfExist = curry((listenerName, model) =>
  compose(
    fEither(model),
    map(fn => fn(model)),
    getProp(listenerName)
  )(model)
)

export const assertIsNotNothing = curry((message, value) =>
  hashedFns({
    true: () => {
      throw message
    },
    false: always(value),
  })(Maybe(value).isNothing())
)

export const getObjProp = curry((prop, element) => Maybe(element[prop]))
