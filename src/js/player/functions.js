import Player from '_player'
import { processCollisions as processSpaceshipCollions } from '_spaceship/functions'

const getSelected = state => state.spaceships.find(spaceship => spaceship.isSelected())
const getUnselected = state => state.spaceships.filter(spaceship => !spaceship.isSelected())

const getPlayersSpaceships = players => {
  const curriedGetPlayers = (acc, player) => [...acc, ...player.getState().spaceships]
  return players.reduce(curriedGetPlayers, [])
}

const getOtherSpaceships = players => spaceship => {
  const allSpaceships = getPlayersSpaceships(players)
  return allSpaceships.filter(item => item !== spaceship)
}

const functions = state => ({
  isUser: () => (state.user === true),
  removePathsAndTargets: canvas => {
    const removeSpaceshipItems = spaceship => spaceship.removePath(canvas).removeTarget(canvas)
    const spaceships = state.spaceships.map(removeSpaceshipItems)
    return Player({
      ...state,
      spaceships,
    })
  },
  newTarget: (coordinate, canvas) => {
    const spaceship = getSelected(state).disselect().newTarget(coordinate, canvas)
    const spaceships = [
      ...getUnselected(state),
      spaceship,
    ]
    return Player({
      ...state,
      spaceships,
    })
  },
  newDestination: destination => {
    const spaceship = getSelected(state).newDestination(destination)
    const spaceships = [
      ...getUnselected(state),
      spaceship,
    ]
    return Player({
      ...state,
      spaceships,
    })
  },
  newPath: canvas => {
    const spaceship = getSelected(state).newPath(canvas)
    const spaceships = [
      ...getUnselected(state),
      spaceship,
    ]
    return Player({
      ...state,
      spaceships,
    })
  },
  select: spaceship => {
    const otherSpaceships = state
      .spaceships
      .filter(sp => sp !== spaceship)
      .map(sp => sp.disselect())

    const spaceships = [
      ...otherSpaceships,
      spaceship.select(),
    ]
    return Player({
      ...state,
      spaceships,
    })
  },
  isReady: () => {
    const isReady = spaceship => spaceship.isReady()
    return state.spaceships.every(isReady)
  },
    // return state.spaceships.reduce((isPlayerStill, spaceship) =>
    // isPlayerStill && spaceship.isStill(), true)},
  update: players => {
    const updateSpaceship = spaceship =>
      spaceship.update(getOtherSpaceships(players)(spaceship))
    const spaceships = state.spaceships.map(updateSpaceship)

    return Player({
      ...state,
      spaceships,
    })
  },
  drawWeapons: () => Player({
    ...state,
    spaceships: state.spaceships.map(spaceship => spaceship.drawBullet()),
  }),

  // // why ?
  // checkFinalCollisions: (players, canvas) => {
  //   const allSpaceships = getPlayersSpaceships(players)
  //   // const getOtherSpaceships = spaceship => allSpaceships.filter(sp => sp !== spaceship)
  //   const checkSpaceshipCollisions = spaceship =>
  //     spaceship.checkCollisionsWithSpaceships(allSpaceships, canvas)
  //   // const spaceships = state.spaceships.map(currSpaceship =>
  //   //   currSpaceship.checkCollisionsWithSpaceships(allSpaceships.filter(sp => sp !== currSpaceship), canvas))
  //   const spaceships = state.spaceships.map(checkSpaceshipCollisions)
  //   return Player({
  //     ...state,
  //     spaceships,
  //   })
  // },
  processCollisions: players => {
    const cGetOtherSpaceships = getOtherSpaceships(players)
    const processCollisions = spaceship => processSpaceshipCollions(spaceship)(cGetOtherSpaceships(spaceship))
    const spaceships = state.spaceships.map(processCollisions)

    // const spaceships = state.spaceships.map(currSpaceship =>
    //   currSpaceship.checkCollisions(allSpaceships.filter(sp => sp !== currSpaceship), canvas))
    return Player({
      ...state,
      spaceships,
    })
  },
  removeDestroyedSpaceships: () => {
    const spaceships = state.spaceships.filter(spaceship => !spaceship.isDestroyed())
    return Player({
      ...state,
      spaceships,
    })
  },
  drawSpaceships: () => {
    const spaceships = state.spaceships.map(spaceship => spaceship.draw())
    return Player({
      ...state,
      spaceships,
    })
  },
  addSpaceship: spaceship => {
    const spaceships = [
      ...state.spaceships,
      spaceship.setColor(state.color),
    ]
    return Player({
      ...state,
      spaceships,
    })
  },
})

export default functions
