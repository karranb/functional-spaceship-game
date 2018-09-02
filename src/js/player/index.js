import elementFunctions from '_utils/functions/element'

import functions from './functions'

const Player = config => {
  const state = {
    ...config,
    spaceships: config.spaceships || [],
  }
  return {
    ...elementFunctions(state),
    ...functions(state),
  }
}

export default Player
