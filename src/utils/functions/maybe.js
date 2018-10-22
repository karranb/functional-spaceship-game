import { compose } from '_utils/functions/base'

export const isMaybeContainer = value => 
  value &&
  typeof value.isNothing === 'function' &&  
  typeof value.map === 'function'&&
  typeof value.flatten === 'function' &&
  typeof value.apply === 'function'

export const isNothing = value => 
  isMaybeContainer(value) && value.isNothing()

export const Some = value => ({
  isNothing: () => false,
  map: fn => compose(Maybe, fn)(value),
  flatten: () => value,
  apply: (...args) => compose(Maybe, value)(...args),
})

export const Nothing = () => ({
  isNothing: () => true,
  map: () => Nothing(),
  flatten: () => null,
  apply: () => Nothing(),
})


export const Maybe = value => {
  const content = isMaybeContainer(value) ? value.flatten() : value
  return content ? Some(content) : Nothing()
}

export const either = (a, b) => isNothing(Maybe(a)) ? Maybe(b).flatten() : Maybe(a).flatten()

export const mapMaybes = (...args) => {
  const newArgs = args.reduce((acc, arg) => (isNothing(acc) || isNothing(arg)) ? Maybe(null)
    : [
      ...acc,
      arg.flatten(),
    ], [])
  return fn => isNothing(newArgs) ? newArgs : fn(...newArgs)
}

export const getPropsAndMap = model => fn => (...props) => {
  const result = model.getProps(...props)
  return mapMaybes(...result)(fn)
}
  