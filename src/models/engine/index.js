import { modelFunctions } from '_utils/model'

const Engine = state => ({ ...modelFunctions(Engine)(state) })

export default Engine
