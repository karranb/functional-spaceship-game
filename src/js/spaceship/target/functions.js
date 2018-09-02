import Target from './index'

const targetSize = 32

const draw = state => () => {
  const { el } = state
  el.position.x = state.coordinate.x() - (targetSize / 2)
  el.position.y = state.coordinate.y() - (targetSize / 2)
  return Target({
    ...state,
  })
}

export default draw
