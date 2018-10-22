/**
 * Taken from https://medium.com/dailyjs/functional-js-with-es6-recursive-patterns-b7d0813ef9e3
 */

export const def = x => typeof x !== 'undefined'

export const isArray = x => Array.isArray(x)

export const spreadArg = fn => (...args) => fn(args)

export const reduce = ([x, ...xs], f, memo, i = 0) =>
  def(x) ? reduce(xs, f, f(memo, x, i), i + 1) : memo

export const reverse = xs => reduce(xs, (memo, x) => [x, ...memo], [])

export const length = ([x, ...xs]) => (def(x) ? 1 + length(xs) : 0)

export const map = (xs, fn) => reduce(xs, (memo, x) => [...memo, fn(x)], [])

export const filter = (xs, fn) => reduce(xs, (memo, x) => (fn(x) ? [...memo, x] : [...memo]), [])

export const reject = (xs, fn) => reduce(xs, (memo, x) => (fn(x) ? [...memo] : [...memo, x]), [])

export const merge = spreadArg(xs => reduce(xs, (memo, x) => [...memo, ...x], []))

export const flatten = xs =>
  reduce(xs, (memo, x) => (x ? (isArray(x) ? [...memo, ...flatten(x)] : [...memo, x]) : []), [])

export const flow = (...args) => init => reduce(args, (memo, fn) => fn(memo), init)

export const compose = (...args) => flow(...reverse(args))
