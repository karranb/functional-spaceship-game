import Player from '_models/player'
import { SPACESHIP_TYPES } from '_utils/constants'
import { startGame } from '_web/screens/game'

const user = Player({
  spaceships: [
    SPACESHIP_TYPES.spaceship1,
    // SPACESHIP_TYPES.spaceship1,
    // SPACESHIP_TYPES.spaceship1
  ],
  isUser: true,
})
const enemy = Player({
  spaceships: [
    SPACESHIP_TYPES.spaceship1,
    //  SPACESHIP_TYPES.spaceship1, SPACESHIP_TYPES.spaceship1
  ],
})

startGame(user, enemy)
