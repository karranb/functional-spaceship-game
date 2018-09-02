import { modelFunctions } from '_utils/model'

const defaultState = {
  spaceships: [],
}

const Player = state => ({
  ...modelFunctions(Player)({
    ...defaultState,
    ...state,
  }),
})

export default Player
