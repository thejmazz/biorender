'use strict'

import { flatUIHexColors } from './colour-utils.js'

export const randMaterial = () => {
  return new THREE.MeshLambertMaterial({
    color: flatUIHexColors[Math.floor(Math.random()*flatUIHexColors.length)],
    transparent: true,
    opacity: 0.6
  })
}
