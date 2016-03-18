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
const createRenderer = (W, H) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(W, H)
  renderer.setClearColor(0x545454)
  document.body.appendChild(renderer.domElement)

  return renderer
}

export const createScene = ({
  W = window.innerWidth,
  H = window.innerHeight,
  fov = 75,
  close = 0.1,
  far = 100000,
  }) => {

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, W / H, close, far)
  const renderer = createRenderer(W, H)

  return { scene, camera, renderer }
}
