import { Maybe, getPropsAndMap } from '_utils/functions/maybe'

export const getState = state => state

export const assignState = constructor => state => additions => 
  constructor({
    ...state,
    ...additions,
  })
export const getProp = object => name => Maybe(object[name])

export const getProps = object => (...names) => names.map(name => Maybe(object[name]))

export const modelFunctions = constructor => state => ({
  getState: () => getState(state),
  assignState: addition => assignState(constructor)(state)(addition),
  getProp: name => getProp(state)(name),
  getProps: (...names) => getProps(state)(...names),
  getPropsAndMap: (...props) => fn => getPropsAndMap(state)(...props)(fn),
})
