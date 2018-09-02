const elementFunctions = state => ({
  onClick: fn => {
    const { el } = state
    el.off('pointerdown')
    el.interactive = true
    el.buttonMode = true
    return el.on('pointerdown', fn)
  },
  removeOnClick: () => {
    const { el } = state
    el.interactive = false
    el.buttonMode = false
    return el.off('pointerdown')
  },

  getEl: () => state.el,

  getState: () => state,

  getSpecs: () => ({
    coordinate: state.coordinate,
    size: state.size,
  }),
})

export default elementFunctions
