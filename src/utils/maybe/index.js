import { and, diff } from '_utils/logic'
import { compose, hashedFns } from '_utils/base'

import { Some, Nothing, isMaybeContainer, flatten } from './functions'

const isNotNill = content =>
  compose(
    and(diff(content, null)),
    diff(undefined)
  )(content)

const getContent = value =>
  hashedFns({
    true: () =>
      hashedFns({
        true: () => flatten(value),
        false: () => value,
      })(!!isMaybeContainer(value)),
    false: () => value,
  })(isNotNill(value))

const Maybe = value =>
  compose(
    content =>
      hashedFns({
        true: () => Some(content),
        false: () => Nothing(),
      })(isNotNill(content)),
    getContent
  )(value)

export default Maybe
