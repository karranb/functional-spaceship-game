import { compose, curry } from '_utils/base'
import { mod, add } from '_utils/math'
import { flip } from '_utils/helper'

export const forEach = curry((fn, arr) => arr.forEach(fn))

export const some = curry((fn, arr) => arr.some(fn))

export const every = curry((fn, arr) => arr.every(fn))

export const find = curry((fn, arr) => arr.find(fn))

export const filter = curry((fn, array) => array.filter(fn))

export const length = array => array.length

export const getItem = curry((array, i) => array[i])

export const getModItem = (list, i) =>
  compose(
    j => list[j],
    flip(mod)(length(list)),
    add(1)
  )(i)
