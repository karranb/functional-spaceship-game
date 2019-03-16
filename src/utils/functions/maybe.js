import { compose } from '_utils/functions/base'
import { getProps } from '_utils/functions/model'


export const isMaybeContainer = value => 
  value &&
  typeof value.isNothing === 'function' &&  
  typeof value.map === 'function'&&
  typeof value.flatten === 'function' &&
  typeof value.apply === 'function'

export const Some = value => ({
  isNothing: () => false,
  map: fn => compose(Maybe, fn)(value),
  flatten: () => value,
  apply: (...args) => compose(Maybe, () => value(...args))(),
})

export const Nothing = () => ({
  isNothing: () => true,
  map: () => Nothing(),
  flatten: () => null,
  apply: () => null,
})


export const Maybe = value => {
  const content = isMaybeContainer(value) ? value.flatten() : value
  return (content !== undefined && content !== null) ? Some(content) : Nothing()
}

export const isNothing = value => Maybe(value).isNothing()

export const either = (a, b) => isNothing(Maybe(a)) ? Maybe(b).flatten() : Maybe(a).flatten()

export const mapMaybes = (...args) => {
  const newArgs = args.reduce((acc, arg) =>
    (isNothing(acc) || isNothing(arg)) ? Maybe(null)
      : [
        ...acc,
        arg.flatten(),
      ], []
    )
  return fn => isNothing(newArgs) ? newArgs : fn(...newArgs)
}

export const getPropsAndMap = state => (...props) => fn => {
  const result = getProps(state)(...props)
  return mapMaybes(...result)(fn)
}
