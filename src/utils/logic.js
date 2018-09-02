import { curry, hashedFns } from '_utils/base'
import { flip } from '_utils/helper'
import Maybe from '_utils/maybe'
import { isNothing } from '_utils/maybe/functions'

export const eq = curry((x, y) => x === y)

export const gt = curry((x, y) => x > y)

export const gte = curry((x, y) => x >= y)

export const lt = curry((x, y) => x < y)

export const lte = curry((x, y) => x <= y)

export const diff = curry((x, y) => x !== y)

export const or = curry((x, y) => x || y)

export const and = curry((x, y) => x && y)

export const not = statement => !statement

export const either = curry((a, b) =>
  hashedFns({
    true: () => Maybe(b).flatten(),
    false: () => Maybe(a).flatten(),
  })(isNothing(Maybe(a)))
)
export const fEither = flip(either)
