import {
  addChild,
  rotate as rotateGraphic,
  setPosition,
  removeChild,
  dettachCursor,
} from '_web/graphic'
import Path from '_web/components/spaceship/path'
import MovingArea from '_web/components/spaceship/movingArea'
import Target from '_web/components/spaceship/target'
import { compose, map, curry } from '_utils/base'
import {
  getSelectedSpaceship,
  replaceSelectedSpaceship,
  selectSpaceshipDestination,
  selectSpaceshipTarget,
} from '_models/engine/functions'
import Coordinate from '_models/coordinate'
import { Spaceship as SpaceshipGraphic, ExplodingSpaceship } from '_web/components/spaceship'
import { fEither } from '_utils/logic'
import { assignState, getProp } from '_utils/model'
import { flip, always } from '_utils/helper'

import {
  activateSpaceshipsSelection,
  activateTargetSelection,
  activateReadyBtn,
  activateMovingAreaSelection,
  deactivateTargetSelection,
  deactivateReadyBtn,
  deactivateSpaceshipsSelection,
} from '../controller'

const removeSpaceshipGraphic = graphicController => spaceship =>
  compose(
    () => assignState({ graphic: null })(spaceship),
    map(removeChild(graphicController)),
    getProp('graphic')
  )(spaceship)

const createGraphicAndSetPosition = curry((graphic, graphicConstructor, coordinate) =>
  compose(
    setPosition(coordinate),
    graphicConstructor
  )(graphic)
)

const createAndAssignGraphic = curry((graphicController, graphicConstructor, model) =>
  compose(
    graphic => model.assignState({ graphic }),
    fEither(null),
    map(addChild(graphicController)),
    map(createGraphicAndSetPosition(model, graphicConstructor)),
    getProp('coordinate'),
    removeSpaceshipGraphic(graphicController)
  )(model)
)

const removeSpaceshipTarget = graphicController => spaceship =>
  compose(
    always(spaceship.assignState({ target: null })),
    map(removeChild(graphicController)),
    getProp('target')
  )(spaceship)

const removeSpaceshipPath = graphicController => spaceship =>
  compose(
    always(spaceship.assignState({ path: null })),
    map(removeChild(graphicController)),
    getProp('path')
  )(spaceship)

const removeMovingArea = graphicController => engine =>
  compose(
    always(engine.assignState({ movingArea: null })),
    map(removeChild(graphicController)),
    getProp('movingArea')
  )(engine)

const createSpaceshipPath = graphicController => spaceship =>
  compose(
    path => spaceship.assignState({ path }),
    addChild(graphicController),
    Path
  )(spaceship)

const replaceSpaceshipPath = graphicController =>
  compose(
    createSpaceshipPath(graphicController),
    removeSpaceshipPath(graphicController),
    getSelectedSpaceship
  )

const createSpaceshipTarget = graphicController => spaceship =>
  compose(
    target => spaceship.assignState({ target }),
    addChild(graphicController),
    Target
  )(spaceship)

const replaceSpaceshipTarget = graphicController => engine =>
  compose(
    createSpaceshipTarget(graphicController),
    removeSpaceshipTarget(graphicController),
    getSelectedSpaceship
  )(engine)

const assignAndActivateMovingArea = engine => graphicController => movingArea =>
  compose(
    activateMovingAreaSelection(movingArea)(graphicController),
    always(engine.assignState({ movingArea }))
  )(movingArea)

export const onSelectSpaceship = spaceship => engine =>
  compose(
    map(graphicController =>
      compose(
        assignAndActivateMovingArea(engine)(graphicController),
        addChild(graphicController)
      )(MovingArea(spaceship))
    ),
    getProp('graphicController'),
    deactivateReadyBtn,
    deactivateSpaceshipsSelection
  )(engine)

export const onMovingAreaSelect = e => graphicController => engine => {
  const { x, y } = e.data.global
  const destination = Coordinate(x, y)

  return compose(
    activateTargetSelection(graphicController),
    removeMovingArea(graphicController),
    spaceship => replaceSelectedSpaceship(spaceship)(engine),
    replaceSpaceshipPath(graphicController),
    selectSpaceshipDestination(destination)
  )(engine)
}

export const onTargetSelect = (graphicController, engine) => e => {
  const { x, y } = e.data.global
  const targetCoordinate = Coordinate(x, y)
  dettachCursor(graphicController)

  return compose(
    activateReadyBtn,
    activateSpaceshipsSelection,
    deactivateTargetSelection,
    flip(replaceSelectedSpaceship)(engine),
    replaceSpaceshipTarget(graphicController),
    selectSpaceshipTarget(targetCoordinate)
  )(engine)
}

export const onSpaceshipStop = graphicController => spaceship => {
  const isDestroyed = compose(
    fEither(false),
    getProp('isDestroyed')
  )(spaceship)
  if (isDestroyed) return spaceship
  return createAndAssignGraphic(graphicController, SpaceshipGraphic, spaceship)
}

export const onRotate = spaceship => {
  spaceship.getPropsAndMap('rotation', 'graphic')(rotateGraphic)
  return spaceship
}

export const onSetCoordinate = spaceship => {
  spaceship.getPropsAndMap('coordinate', 'graphic')(setPosition)
  return spaceship
}

const assignExplodingGraphic = (spaceship, graphicController) => () =>
  compose(
    graphic => createAndAssignGraphic(graphicController, graphic, spaceship),
    ExplodingSpaceship
  )(graphicController)

export const onDestroySpaceship = curry((graphicController, spaceship) =>
  compose(
    always(spaceship),
    assignExplodingGraphic(spaceship, graphicController),
    map(removeChild(graphicController)),
    getProp('graphic')
  )(spaceship)
)
