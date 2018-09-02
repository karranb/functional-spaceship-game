import {
  engineFunctions,
  activateSpaceshipsSelection,
  deactivateSpaceshipsSelection,
  activateMovingAreaSelection,
  deactivateMovingAreaSelection,
  activateTargetSelection,
  deactivateTargetSelection,
  newRound,
} from './functions'

import elementFunctions from '_utils/functions/element'

const Engine = state => ({
  ...engineFunctions(state),
  ...elementFunctions(state),
  activateSpaceshipsSelection: () => activateSpaceshipsSelection(state),
  deactivateSpaceshipsSelection: () => deactivateSpaceshipsSelection(state),
  activateMovingAreaSelection: () => activateMovingAreaSelection(state),
  deactivateMovingAreaSelection: () => deactivateMovingAreaSelection(state),
  activateTargetSelection: () => activateTargetSelection(state),
  deactivateTargetSelection: () => deactivateTargetSelection(state),
  newRound: () => newRound(state),
})

export default Engine
