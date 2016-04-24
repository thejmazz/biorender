'use strict'

import { flatUIHexColors } from './colour-utils.js'

export const randMaterial = (transparency=false) => {
  return new THREE.MeshLambertMaterial({
    color: flatUIHexColors[Math.floor(Math.random()*flatUIHexColors.length)],
    transparent: transparency,
    opacity: 0.6
  })
}
