'use strict'

import { createScene, createStats } from './create.js'
import cell from './cell'

const { scene, camera, renderer } = createScene({})
camera.position.set(0,0,2)


const aLight = new THREE.AmbientLight(0xe6e6e6)
scene.add(aLight)

// const dLight = new THREE.DirectionalLight(0xe6e6e6, 1)
// dLight.position.set(0,100,0)
// scene.add(dLight)

const hLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 1)
hLight.position.set(0, 2600, 0)
scene.add(hLight)
scene.add(new THREE.HemisphereLightHelper(hLight, 20))

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0, 0, -10)
scene.add(camera)


const controls = new THREE.OrbitControls(camera)
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
