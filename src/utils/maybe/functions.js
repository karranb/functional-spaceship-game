import { compose } from '_utils/base'
import { flip } from '_utils/helper'
import { eq, and, not } from '_utils/logic'
import { every } from '_utils/array'

import Maybe from './index'

export const Nothing = () => ({
  isNothing: () => true,
  map: () => Nothing(),
  flatten: () => null,
  apply: () => null,
})

export const isNothing = value => Maybe(value).isNothing()

export const isMaybeContainer = value =>
  compose(
    flip(and)(eq(typeof value.apply, 'function')),
    flip(and)(eq(typeof value.flatten, 'function')),
    flip(and)(eq(typeof value.map, 'function')),
    flip(and)(eq(typeof value.isNothing, 'function'))
  )(value)

export const Some = value => ({
  isNothing: () => false,
  map: fn =>
    compose(
      Maybe,
      fn
    )(value),
  flatten: () => value,
  apply: (...args) =>
    compose(
      Maybe,
      () => value(...args)
    )(),
})

export const areSome = maybes => every(maybe => not(isNothing(maybe)), maybes)

export const flatten = maybe => maybe.flatten()
