import { modelFunctions } from '_utils/model'

const defaultState = {
  bullets: [],
}

const Spaceship = state => ({
  ...modelFunctions(Spaceship)({
    ...defaultState,
    ...state,
  }),
})

export default Spaceship
