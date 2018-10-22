import { modelFunctions } from '_utils/functions/model'

const defaultState = {
  spaceships: []
}

const Player = state => ({
  ...modelFunctions(Player)({
    ...defaultState,
    ...state,
  }),
})

export default Player
