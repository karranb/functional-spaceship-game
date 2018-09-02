import { setPosition, removeChild } from '_web/graphic'
import { compose, map } from '_utils/base'
import { getProp } from '_utils/model'
import { always } from '_utils/helper'

export const onBulletMove = bullet =>
  compose(
    always(bullet),
    bullet.getPropsAndMap('coordinate', 'graphic'),
    always((coordinate, graphic) => setPosition(coordinate)(graphic))
  )()

export const onDestroyBullet = graphicController => bullet =>
  compose(
    always(bullet),
    map(removeChild(graphicController)),
    getProp('graphic')
  )(bullet)
