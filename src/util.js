'use strict'

import Stats from 'stats.js'

/**
 * Adds stats box to DOM.
 * @return {Object} the stats object for reference
 */
export const createStats = () => {
  const stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0px'
  stats.domElement.style.top = '0px'
  document.body.appendChild(stats.domElement)

  return stats
}

/**
 * Create THREE renderer
 * @param  {int} W width
 * @param  {int} H height
 * @return {Object}   THREE renderer
 */
export const createRenderer = (W, H) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(W, H)
  renderer.setClearColor(0xffffff)
  document.body.appendChild(renderer.domElement)

  return renderer
}
