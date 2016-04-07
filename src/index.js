'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0xffffff,
  antialias: true
})
window.scene = scene

camera.position.set(0,0,5)

import sceneGraphConstructor from './scene'
const sceneGraph = sceneGraphConstructor()

const keyframes = []
for (let obj3DKey of Object.keys(sceneGraph)) {
  const obj3D = sceneGraph[obj3DKey]

  if (obj3D.keyframe) {
    keyframes.push(obj3D.keyframe)
  }

  scene.add(obj3D)
}

// ===========================================================================

const OBJLoader = new THREE.OBJLoader()

const controls = new THREE.OrbitControls(camera, renderer.domElement)

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0,0,-0.1)
scene.add(camera)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
)
ground.position.set(0,-2,0)
ground.rotation.x = Math.PI/2
scene.add(ground)

OBJLoader.load('/models/cristae.obj', (object) => {
  let curved = []
  let rim = []
  let etc = []

  console.log(object)

  object.children.forEach( (child) => {
    child.name = child.name.split('_')[0]

    console.log(child.name)
    if (child.name === 'Cristae.Curved') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      curved.push(child)
    } else if (child.name === 'Cristae.ETC') {
      child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})
      etc.push(child)
    } else if (child.name === 'Cristae.Rim') {
      child.material = new THREE.MeshLambertMaterial({color: 0x6d12e0, side: THREE.DoubleSide})
      rim.push(child)
    }
  })

  curved.forEach(curve => scene.add(curve))
  rim.forEach(r => scene.add(r))
  etc.forEach(e => scene.add(e))
})

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
