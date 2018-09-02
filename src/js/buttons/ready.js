import * as PIXI from 'pixi.js'

import elementFunctions from '_utils/functions/element'

const ReadyBtn = config => {
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'],
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
  })
  const el = new PIXI.Text('READY', style)
  el.x = 600
  el.y = 50
  const state = {
    ...config,
    el,
  }
  return {
    ...elementFunctions(state),
  }
}

export default ReadyBtn
