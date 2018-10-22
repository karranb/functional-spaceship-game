import { modelFunctions } from '_utils/functions/model'

const defaultState = {
  bullets: [],
}

const Spaceship = state => ({
   ...modelFunctions(Spaceship)({
    ...defaultState, 
    ...state,
  })
})

export default Spaceship
