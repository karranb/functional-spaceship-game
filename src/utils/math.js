import { curry } from '_utils/base'

export const degreesToRadians = degrees => degrees * (Math.PI / 180)

export const randomBetween = curry((min, max) => Math.random() * (max - min) + min)

export const sub = curry((x, y) => x - y)

export const add = curry((x, y) => x + y)

export const mult = curry((x, y) => x * y)

export const div = curry((x, y) => x / y)

export const mod = curry((x, y) => x % y)

export const pow = curry((x, y) => x ** y)
