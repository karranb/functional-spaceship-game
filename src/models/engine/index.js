import modelFunctions from '_utils/functions/model'

const Engine = state => ({
  ...modelFunctions(state),
})

export default Engine
