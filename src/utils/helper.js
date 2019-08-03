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

export const timed = (name, fn) => {
  /* eslint-disable-next-line */
  if (!console.time || !console.timeEnd) return fn()
  /* eslint-disable-next-line */
  for (var i = 0; i < 10; i++) fn()
  /* eslint-disable-next-line */
  console.time(name)
  /* eslint-disable-next-line */
  for (var i = 0; i < 5000; i++) fn()
  /* eslint-disable-next-line */
  console.timeEnd(name)
  return null
}

export const supportWasm = () => {
  // return false
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      )
      if (module instanceof WebAssembly.Module)
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
    }
  } catch (e) {
    console.log(e) // eslint-disable-line
  }
  return false
}
