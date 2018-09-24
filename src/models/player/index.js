import modelFunctions from '_utils/functions/model'
import { emptyFn } from '_utils/functions/base'

const Player = ({ onSelectSpaceship = emptyFn, spaceships = [], ...state }) => ({
  ...modelFunctions({
    onSelectSpaceship,
    spaceships,
    ...state,
  }),
})

export default Player
