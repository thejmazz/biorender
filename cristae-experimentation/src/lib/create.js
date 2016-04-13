'use strict'

import Stats from 'stats.js'

/**
 * Adds stats box to DOM.
 * @return {Object} the stats object for reference
 */
export const createStats = () => {
  const stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '10px'
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
const createRenderer = (W, H, clearColor, size) => {
  const renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(W * size, H * size)
  renderer.setClearColor(clearColor)
  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.width = '100%';

  return renderer
}

export const createScene = ({
  W = window.innerWidth,
  H = window.innerHeight,
  size = 1,
  fov = 75,
  close = 0.01,
  far = 100000,
  clearColor = 0xffffff
  }) => {

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, W / H, close, far)
  const renderer = createRenderer(W, H, clearColor, size)

  return { scene, camera, renderer }
}
