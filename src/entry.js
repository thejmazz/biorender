'use strict'

import { createScene, createStats } from './create.js'
import cell from './cell'

const { scene, camera, renderer } = createScene({})
camera.position.set(0,0,2)

const controls = new THREE.TrackballControls(camera)
controls.maxDistance = 17500
controls.minDistance = 1.5
console.log(controls)

scene.add(cell)

const stats = createStats()
const render = () => {
  stats.begin()

  renderer.render(scene, camera)
  controls.update()

  stats.end()
  requestAnimationFrame(render)
}

render()
