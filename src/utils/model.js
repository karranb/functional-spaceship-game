import { curry, compose, hashedFns, reduce } from '_utils/base'
import { or } from '_utils/logic'
import { flip } from '_utils/helper'
import { isNothing } from '_utils/maybe/functions'
import Maybe from '_utils/maybe'

const processMaybeArgs = args =>
  reduce(
    (acc, arg) =>
      hashedFns({
        true: () => Maybe(null),
        false: () => [...acc, arg.flatten()],
      })(or(isNothing(acc), isNothing(arg))),
    [],
    args
  )

const mapMaybes = (...args) => fn =>
  compose(
    newArgs =>
      hashedFns({
        true: () => newArgs,
        false: () => fn(...newArgs),
      })(isNothing(newArgs)),
    processMaybeArgs
  )(args)

const assignModelState = (constructor, state, additions) =>
  constructor({
    ...state,
    ...additions,
  })

export const getObjProp = curry((prop, element) => Maybe(element[prop]))

export const getObjProps = object => (...names) => names.map(name => getObjProp(name, object))

export const getObjPropsAndMap = state => (...props) => fn =>
  compose(
    result => mapMaybes(...result)(fn),
    () => getObjProps(state)(...props)
  )()

export const getState = state => state

export const assignState = curry((state, element) => element.assignState(state))

export const fAssignState = flip(assignState)

export const getPropsAndMap = element => (...args) => fn => element.getPropsAndMap(...args)(fn)

export const getProp = arg => element => element.getProp(arg)

export const modelFunctions = constructor => state => ({
  getState: () => getState(state),
  assignState: addition => assignModelState(constructor, state, addition),
  getProp: name => getObjProp(name, state),
  getProps: (...names) => getObjProps(state)(...names),
  getPropsAndMap: (...props) => fn => getObjPropsAndMap(state)(...props)(fn),
})
