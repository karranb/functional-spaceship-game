/**
 * Taken from https://medium.com/dailyjs/functional-js-with-es6-recursive-patterns-b7d0813ef9e3
 */

export const def = x => typeof x !== 'undefined'

export const curry = (fn, n = fn.length, args = []) => (...newArgs) =>
  args.length + newArgs.length >= n ? fn(...args, ...newArgs) : curry(fn, n, [...args, ...newArgs])

export const isArray = x => Array.isArray(x)

const reduceFn = (f, init, arr) => {
  const len = arr.length
  if (!len) return init
  let memo = init
  for (let i = 0; i < len; i += 1) {
    const x = arr[i]
    if (!def(x)) return memo
    memo = f(memo, x, i)
  }
  return memo
}

export const reduce = curry(reduceFn, 3)

export const reverse = xs => reduce((memo, x) => [x, ...memo], [], xs)

const mapFn = (fn, xs) => xs.map(fn)

export const map = curry(mapFn)

export const flow = (...args) => init => reduce((memo, fn) => fn(memo), init, args)

export const compose = (...args) => flow(...reverse(args))

export const hashedFns = curry((fns, hash) => {
  const fn = fns[hash]
  if (!fn) {
    throw 'Invalid case' // eslint-disable-line
  }
  return fn()
})
