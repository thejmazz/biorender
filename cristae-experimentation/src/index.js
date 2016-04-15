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

import {
  crudeSynthaseCreator,
  crudeDimerCreator,
  dimerCreator,
  constructSynthase,
  constructDimer
} from './scene/meshes/atp-synthase.js'

import { constructCristae } from './scene/meshes/cristae.js'
import { constructETC } from './scene/meshes/etc.js'

const OBJLoader = new THREE.OBJLoader()

const controls = new THREE.OrbitControls(camera, renderer.domElement)

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0,0,-0.1)
scene.add(camera)

const aLight = new THREE.AmbientLight(0xe6e6e6, 0.5)
scene.add(aLight)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
)
ground.position.set(0,-2,0)
ground.rotation.x = Math.PI/2
scene.add(ground)

const populateCristae = (object, dimer) => {
  const { curved, etc, rim } = constructCristae(object)

  scene.add(curved)
  scene.add(etc)
  scene.add(rim)

  // Bounding box around curved section
  const curvedHelper = new THREE.BoundingBoxHelper(curved, 0xf6f400)
  curvedHelper.update()
  // scene.add(curvedHelper)

  // Pull out position and scale of curved section
  const curvedPosition = curvedHelper.position
  const curvedScale = curvedHelper.scale

  // helper sphere
  const sphereGeom = new THREE.SphereGeometry(0.01, 16, 16)
  const sphere = new THREE.Mesh(sphereGeom, new THREE.MeshLambertMaterial({color: 0x158e41}))
  sphere.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  // scene.add(sphere)

  // const dimer = crudeDimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator())
  // TODO rotate from center of group
  // dimer.rotation.x = Math.PI/2
  dimer.rotation.z = Math.PI/2
  dimer.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  // dimer.position.set(-0.983, 0.83, -0.02)
  // scene.add(dimer)

  // Get dimer dimensions
  const dimerHelper = new THREE.BoundingBoxHelper(dimer, 0xf6f400)
  dimerHelper.update()
  // scene.add(dimerHelper)
  const dimerScale = dimerHelper.scale
  // console.log(dimerScale)
  // By inspection, z is the size we want..

  let currentSpot = -curvedScale.y/2 + dimerScale.y + 0.005
  while (currentSpot <= curvedScale.y/2 + dimerScale.y/2) {
    const anotherDimer = dimer.clone()
    // anotherDimer.position.set(-0.983, currentSpot, -0.02)
    anotherDimer.position.set(curvedPosition.x - curvedScale.x/2, currentSpot, curvedPosition.z - 0.055)
    lods.push(anotherDimer)
    scene.add(anotherDimer)

    currentSpot += dimerScale.y
  }
}

let lods = []

async function init() {
  // TODO dont delay loading of models with

  // === Dimer ===
  const synthaseModels = ['/models/ATP-synthase_d0.05.obj', '/models/ATP-synthase_d0.01.obj']
  const synthaseGeoms = await Promise.all(synthaseModels.map(model => OBJLoaderAsync(model)))

  const lod = makeLOD({
    meshes: synthaseGeoms.map(geom => constructDimer(geom)),
    distances: [0.2, 0.21]
  })
  lod.position.set(0, 0, 1)
  lod.updateMatrix()
  // scene.add(lod)
  // lods.push(lod)

  // === Cristae ===
  const cristaeModel = await OBJLoaderAsync('/models/cristae_polygroups.obj')
  // populateCristae(cristaeModel, crudeDimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator()))
  populateCristae(cristaeModel, lod)

  // === ETC ===
  const ETCModels = [
    '/models/ETC/ETC.obj',
    // '/models/ETC/ETC_d0.1.obj',
    '/models/ETC/ETC_d0.05.obj',
    '/models/ETC/ETC_d0.01.obj'
  ]
  const ETCGeoms = await Promise.all(ETCModels.map(model => OBJLoaderAsync(model)))

  const etcLOD = makeLOD({
    meshes: ETCGeoms.map(geom => constructETC(geom)),
    distances: [20, 40, 60]
  })

  scene.add(etcLOD)
  lods.push(etcLOD)
}

init()

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  for (let lod of lods) {
    lod.update(camera)
  }

  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
