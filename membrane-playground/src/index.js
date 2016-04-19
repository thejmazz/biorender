'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0xffffff,
  antialias: true,
  size: 1
})
window.scene = scene

// ===========================================================================

camera.position.set(0,0,1.5)

// ===========================================================================

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

import { OBJLoaderAsync, textureLoader } from './lib/loaders.js'
import { makeLOD } from './lib/lod.js'
import { flatUIHexColors, generateShades } from './lib/loaders.js'

import {
  crudeSynthaseCreator,
  crudeDimerCreator,
  dimerCreator,
  constructSynthase,
  constructDimer
} from './scene/meshes/atp-synthase.js'

import { constructCristae } from './scene/meshes/cristae.js'
import { constructETC } from './scene/meshes/etc.js'

// === FUNCTIONS ===

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const OBJLoader = new THREE.OBJLoader()

const controls = new THREE.OrbitControls(camera, renderer.domElement)
// const controls = new THREE.FlyControls(camera)
// controls.movementSpeed = 5 //0.5
// controls.domElement = renderer.domElement
// controls.rollSpeed = (Math.PI / 6)*10
// controls.autoForward = false
// controls.dragToLook = false

const initGlobalLights = () => {
  const cLight = new THREE.PointLight(0xffffff, 1, 5)
  camera.add(cLight)
  cLight.position.set(0,0,-0.001)
  scene.add(camera)

  const aLight = new THREE.AmbientLight(0xe6e6e6, 0.5)
  scene.add(aLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 10),
    new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
  )
}

const initGround = () => {
  const geom = new THREE.PlaneGeometry(100, 100, 100, 100)
  const materials = [
    new THREE.MeshLambertMaterial({color: 0xdadada, side: THREE.DoubleSide}),
    new THREE.MeshLambertMaterial({color: 0xff00000, wireframe: true})
  ]

  const ground = new THREE.SceneUtils.createMultiMaterialObject(geom, materials)

  ground.position.set(0,-2,0)
  ground.rotation.x = Math.PI/2
  scene.add(ground)
}

const wireframePlane = (length, width, xSeg, ySeg, col1, col2) => {
  const geom = new THREE.PlaneGeometry(length, width, xSeg, ySeg)
  const materials = [
    new THREE.MeshLambertMaterial({color: col1, side: THREE.DoubleSide}),
    new THREE.MeshLambertMaterial({color: col2, wireframe: true})
  ]

  const ground = new THREE.SceneUtils.createMultiMaterialObject(geom, materials)

  ground.rotation.x = Math.PI/2

  return ground
}

const initMembrane = (length, width, thickness) => {
  const topLayer = wireframePlane(100, 100, 100, 100, 0xdadada, 0xff000000)
  topLayer.position.set(0, 2, 0)
  scene.add(topLayer)

  const bottomLayer = wireframePlane(100, 100, 100, 100, 0xdadada, 0xff000000)
  bottomLayer.position.set(0, -2, 0)
  scene.add(bottomLayer)
}


async function init() {
  initGlobalLights()
  initMembrane()
}




init()

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

// const clock = new THREE.Clock()

const stats = createStats()
const render = () => {
  stats.begin()

  // const delta = clock.getDelta()

  // for (let keyframe of keyframes) {
  //   keyframe()
  // }

  // for (let lod of lods) {
  //   lod.update(camera)
  // }

  // controls.update(delta*0.1)
  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
