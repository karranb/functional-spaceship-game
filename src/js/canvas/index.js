import canvasFunctions from '_canvas/functions'
import elementFunctions from '_utils/functions/element'

const Canvas = (state = {}) => ({
  ...elementFunctions(state),
  ...canvasFunctions(state),
})

export default Canvas
