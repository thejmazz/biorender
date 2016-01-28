'use strict'

import { createScene, createStats } from './util.js'
import cube from './cube.js'

const { scene, camera, renderer } = createScene({})

const sceneObjects = []
sceneObjects.push(cube)

sceneObjects.forEach( obj => scene.add(obj) )

camera.position.set(0,0,2)

const stats = createStats()
const render = () => {
  stats.begin()

  renderer.render(scene, camera)

  stats.end()
  requestAnimationFrame(render)
}

render()
