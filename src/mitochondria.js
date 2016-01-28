'use strict'

import OrbitControls from 'three-orbit-controls'

import { createStats, createRenderer } from './util.js'
import cube from './cube.js'

const W = window.innerWidth
const H = window.innerHeight

// scene, camera, renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100000)
const renderer = createRenderer(W, H)


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
