import { modelFunctions } from '_utils/functions/model'

const Engine = state => ({ ...modelFunctions(Engine)(state) })

export default Engine
