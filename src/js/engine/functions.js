/* global requestAnimationFrame, performance */
import * as PIXI from 'pixi.js'

import Coordinate from '_utils/coordinate'
import Engine from '_engine/index'
import MovingArea from '_spaceship/movingArea'
import Spaceship from '_spaceship'

import ReadyBtn from '_buttons/ready'

import Player from '_player'

import { degreesToRadians } from '_utils/functions/helper'

import { GAME_SIZE } from '_utils/constants'


const getUser = state => state.players.find(player => player.isUser())
const getNonUsers = state => state.players.filter(player => !player.isUser())

export const activateReadyBtn = state => {
  state.readyBtn.onClick(() => {
    deactivateReadyBtn(state)
    startUpdate(state)
  })
  return Engine({ ...state })
}

export const deactivateReadyBtn = state => {
  state.readyBtn.removeOnClick()
  return Engine({ ...state })
}

export const activateSpaceshipsSelection = state => {
  const user = getUser(state)
  if (user) {
    user.getState().spaceships.forEach(spaceship => {
      spaceship.onClick(() => spaceshipSelect(state, spaceship))
    })
  }
  return Engine({ ...state })
}

export const deactivateSpaceshipsSelection = state => {
  const user = getUser(state)
  if (user) {
    user.getState().spaceships.forEach(spaceship => {
      spaceship.removeOnClick()
    })
  }

  return Engine({ ...state })
}

export const activateMovingAreaSelection = state => {
  const { movingArea } = state
  movingArea.onClick(data => movingAreaSelect(state, data))
  return Engine({ ...state })
}

export const deactivateMovingAreaSelection = state => {
  const { movingArea } = state
  if (movingArea) {
    state.canvas.removeChild(movingArea)
  }
  activateReadyBtn(state)
  return Engine({ ...state })
}

export const activateTargetSelection = state => {
  state.canvas.onClick(data => targetSelect(state, data))
  state.canvas.attachCursor()
  return Engine({ ...state })
}

export const deactivateTargetSelection = state => {
  state.canvas.removeOnClick()
  state.canvas.dettachCursor()
  activateReadyBtn(state)
  return Engine({ ...state })
}


const targetSelect = (state, e) => {
  const targetCoordinate = Coordinate(e.data.global.x, e.data.global.y)
  const players = [
    ...getNonUsers(state),
    getUser(state).newTarget(targetCoordinate, state.canvas),
  ]
  Engine({ ...state, players }).deactivateTargetSelection().activateSpaceshipsSelection()
}

const update = (ticker, state, time) => {
  ticker.update(time)
  console.log(`FPS: ${ticker.FPS}`)
  const updatePlayer = player => player.update(state.players)
  const isReady = player => player.isReady()
  const players = state.players.map(updatePlayer)
    .reduce((acc, player, _, allPlayers) => ([
      ...acc,
      player.processCollisions(allPlayers),
    ]), []).map(player => player.removeDestroyedSpaceships())
  const allReady = players.every(isReady)
  if (allReady) {
    return Engine({
      ...state,
      players,
    }).newRound()
  }

  return requestAnimationFrame(step =>
    update(
      ticker,
      {
        ...state,
        players,
      },
      step,
    ))
}

const startUpdate = state => {
  const ticker = new PIXI.ticker.Ticker()
  ticker.autoStart = false
  ticker.stop()
  const players = state.players.map(player => player.removePathsAndTargets(state.canvas).drawWeapons())
  const engine = Engine({ ...state, players }).deactivateSpaceshipsSelection().deactivateTargetSelection().deactivateMovingAreaSelection()
  update(ticker, engine.getState(), performance.now())
}

const movingAreaSelect = (state, e) => {
  const { x, y } = e.data.global
  const destination = Coordinate(x, y)

  const players = [
    ...getNonUsers(state),
    getUser(state).newDestination(destination).newPath(state.canvas),
  ]

  return Engine({ ...state, players }).deactivateMovingAreaSelection().activateTargetSelection()
}


const spaceshipSelect = (state, spaceship) => {
  const coordinate = spaceship.getCoordinate()
  const movingArea = MovingArea({ coordinate })
  state.canvas.addChild(movingArea.draw())
  const players = [
    ...getNonUsers(state),
    getUser(state).select(spaceship),
  ]
  Engine({ ...state, players, movingArea }).deactivateSpaceshipsSelection().activateMovingAreaSelection()
}

const getSpaceships = state => {
  const { players } = state
  return players.reduce((ships, player) => [
    ...ships,
    ...player.getState().spaceships,
  ], [])
}

const createDefaultPlayer = () =>
  [
    Player({
      color: 0x00ffff,
      user: true,
    })
      .addSpaceship(Spaceship({
        coordinate: Coordinate(50, 50),
        shield: 700,
      }).rotate(degreesToRadians(314)))
      .addSpaceship(Spaceship({
        coordinate: Coordinate(120, 50),
        shield: 700,
      }).rotate(degreesToRadians(315)))
      .addSpaceship(Spaceship({
        coordinate: Coordinate(50, 120),
        shield: 700,
      }).rotate(degreesToRadians(315))),
    Player({
      color: 0xffff00,
      user: false,
    })
      .addSpaceship(Spaceship({
        coordinate: Coordinate(GAME_SIZE.w() - 50, GAME_SIZE.h() - 50),
        shield: 700,
      }).rotate(degreesToRadians(360 - 314)))
      .addSpaceship(Spaceship({
        coordinate: Coordinate(GAME_SIZE.w() - 120, GAME_SIZE.h() - 50),
        shield: 700,
      }).rotate(degreesToRadians(360 - 315)))
      .addSpaceship(Spaceship({
        coordinate: Coordinate(GAME_SIZE.w() - 50, GAME_SIZE.h() - 120),
        shield: 700,
      }).rotate(degreesToRadians(360 - 315))),
  ]

export const newRound = state => {
  const round = state.round + 1
  const players = state.players.filter(player => player.getState().spaceships.length)
  const newState = {
    ...state,
    round,
    players,
  }
  const engine = Engine(newState)
  if (round >= 15 || players.length < 2) {
    deactivateReadyBtn(newState)
    return engine
  }
  activateReadyBtn(newState)
  return engine
    .activateSpaceshipsSelection()
}


export const engineFunctions = state => ({
  initiate: () => {
    const readyBtn = new ReadyBtn()
    state.canvas.addChild(readyBtn)
    const players = [
      ...createDefaultPlayer(),
    ]
    .map(player => player.drawSpaceships())
    Engine({ ...state, players, round: 0, readyBtn }).addSpaceshipsToCanvas().newRound()
  },
  addSpaceshipsToCanvas: () => {
    getSpaceships(state).forEach(spaceship => {
      state.canvas.addChild(spaceship)
    })
    return Engine({ ...state })
  },
})
