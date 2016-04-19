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
// const controls = new THREE.FlyControls(camera)
// controls.movementSpeed = 5 //0.5
// controls.domElement = renderer.domElement
// controls.rollSpeed = (Math.PI / 6)*10
// controls.autoForward = false
// controls.dragToLook = false

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
ground.position.set(0,-2,0)
ground.rotation.x = Math.PI/2
scene.add(ground)

const flatUIHexColors = [ 0x1abc9c, 0x16a085, 0x2ecc71, 0x27ae60, 0x3498db, 0x2980b9, 0x9b59b6, 0x8e44ad, 0x34495e, 0x2c3e50, 0xf1c40f, 0xf39c12, 0xe67e22, 0xd35400, 0xe74c3c, 0xc0392b, 0xecf0f1, 0xbdc3c7, 0x95a5a6, 0x7f8c8d]

const populateCristae = (object, dimer, etcProteins) => {
  const { curved, etc, rim } = constructCristae(object)

  scene.add(curved)
  scene.add(etc)
  scene.add(rim)

  // // Bounding box around curved section
  // const curvedHelper = new THREE.BoundingBoxHelper(curved, 0xf6f400)
  // curvedHelper.update()
  // // scene.add(curvedHelper)
  //
  // // Pull out position and scale of curved section
  // const curvedPosition = curvedHelper.position
  // const curvedScale = curvedHelper.scale
  //
  // // const dimer = crudeDimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator())
  // // TODO rotate from center of group
  // // dimer.rotation.x = Math.PI/2
  // dimer.rotation.z = Math.PI/2
  // dimer.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  // // dimer.position.set(-0.983, 0.83, -0.02)
  // // scene.add(dimer)
  //
  // // Get dimer dimensions
  // const dimerHelper = new THREE.BoundingBoxHelper(dimer, 0xf6f400)
  // dimerHelper.update()
  // // scene.add(dimerHelper)
  // const dimerScale = dimerHelper.scale
  // // console.log(dimerScale)
  // // By inspection, z is the size we want..
  //
  // let currentSpot = -curvedScale.y/2 + dimerScale.y + 0.005
  // while (currentSpot <= curvedScale.y/2 + dimerScale.y/2) {
  //   const anotherDimer = dimer.clone()
  //   // anotherDimer.position.set(-0.983, currentSpot, -0.02)
  //   anotherDimer.position.set(curvedPosition.x - curvedScale.x/2, currentSpot, curvedPosition.z - 0.055)
  //   lods.push(anotherDimer)
  //   scene.add(anotherDimer)
  //
  //   currentSpot += dimerScale.y*1.5
  // }

  // === ETC ===
  const etcMax = etc.geometry.boundingBox.max
  const etcMin = etc.geometry.boundingBox.min

  // helper sphere
  // const sphereGeom = new THREE.SphereGeometry(0.01, 16, 16)
  // const sphere = new THREE.Mesh(sphereGeom, new THREE.MeshLambertMaterial({color: 0x158e41}))
  // sphere.position.set((etcMax.x - etcMin.x)/2, etcMax.y, (etcMax.z - etcMin.z)/2)
  // // scene.add(sphere)

  for (let i=0; i < 8; i++) {
    for (let j=0; j < 10; j++) {
      const anotherETC = etcProteins.clone()

      anotherETC.rotation.y = Math.random() * 2 * Math.PI

      anotherETC.position.set((etcMax.x - etcMin.x)/2 - 0.07 - i*0.21, etcMax.y - 0.05 - j*0.15, (etcMax.z - etcMin.z)/2 - 0.125)

      scene.add(anotherETC)
      lods.push(anotherETC)

      // const anotherETC2 = etcProteins.clone()
      // anotherETC2.rotation.z = Math.PI
      // anotherETC2.position.set((etcMax.x - etcMin.x)/2 - 0.07 - i*0.21, etcMax.y - 0.05 - j*0.15, (etcMax.z - etcMin.z)/2 - 0.225)
      //
      // scene.add(anotherETC2)
      // lods.push(anotherETC2)
    }
  }

  // etcProteins.position.set((etcMax.x - etcMin.x)/2 - 0.07, etcMax.y - 0.05, (etcMax.z - etcMin.z)/2 - 0.125)
  // scene.add(etcProteins)
  // lods.push(etcProteins)
}

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateShades = (hue, numOfShades) => {
  let shades = [`hsl(${hue}, 100%, 50%)`]

  for (let i=0; i < numOfShades; i++) {
    shades.push(`hsl(${hue}, ${rand(10,90)}%, ${rand(10,90)}%)`)
  }

  return shades
}

let pinchesBoxes = []
async function makePiecesMito() {
  const mitochondria = await OBJLoaderAsync('/models/Mitochondria/mitochondria.obj')

  let pinches = []

  let walls = []
  let outerMembrane, base

  for (let i=1; i < mitochondria.children.length; i++) {
    const mesh = mitochondria.children[i]

    const name = mesh.name.replace(/Cube\.\d+_?/, '')

    if (name.indexOf('Pinch') !== -1) {
      // console.log('pinch: ', name)
      pinches.push(mesh)
    } else if (name.indexOf('Wall') !== -1) {
      // console.log('wall: ', name)
      walls.push(mesh)
    } else if (name.indexOf('Membrane.Outer') !== -1) {
      // console.log('outer membrane: ', name)
      outerMembrane = mesh
    } else if (name.indexOf('Base') !== -1) {
      // console.log('base: ', name)
    } else {
      console.log('else: ', name)
    }
  }

  pinches.forEach( (mesh) => {
    // scene.add(mesh)
    const bbox = new THREE.BoundingBoxHelper(mesh, 0x000000)
    bbox.update()
    pinchesBoxes.push(bbox)
    // scene.add(bbox)
  })
}

async function makeUnifiedMito() {
  const mitochondria = await OBJLoaderAsync('/models/Mitochondria/mitochondria_unified.obj')
  // console.log(mitochondria)

  let meshes = []
  for (let i=0; i < mitochondria.children.length; i++) {
    const mesh = mitochondria.children[i]
    mesh.material = new THREE.MeshLambertMaterial({color: 0x84dd72})
    mesh.material.wireframe = false

    meshes.push(mesh)
  }

  meshes.forEach(mesh => scene.add(mesh))
}

let lods = []

async function init() {
  // TODO dont delay loading of models with

  // // === ETC ===
  // const ETCModels = [
  //   // '/models/ETC/ETC.obj',
  //   '/models/ETC/ETC_d0.1.obj',
  //   '/models/ETC/ETC_d0.05.obj',
  //   '/models/ETC/ETC_d0.01.obj'
  // ]
  // const ETCGeoms = await Promise.all(ETCModels.map(model => OBJLoaderAsync(model)))
  //
  //
  // const etcScale = 0.0045
  // const etcLOD = makeLOD({
  //   meshes: ETCGeoms.map(geom => constructETC(geom)),
  //   distances: [20, 40, 60].map(num => num*etcScale)
  // })
  //
  // etcLOD.rotation.x = Math.PI/2
  // etcLOD.rotation.y = Math.PI
  // etcLOD.position.set(0,0,1)
  // etcLOD.scale.set(1*etcScale, 1*etcScale, 1*etcScale)
  //
  // // scene.add(etcLOD)
  // // lods.push(etcLOD)
  //
  //
  // // === Cristae ===
  // const cristaeModel = await OBJLoaderAsync('/models/cristae_polygroups.obj')
  // // populateCristae(cristaeModel, crudeDimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator()))
  // populateCristae(cristaeModel, lod, etcLOD)

  await makeUnifiedMito()
  await makePiecesMito()

  // === Dimer ===
  const synthaseModels = ['/models/ATP-Synthase/ATP-Synthase_d0.05.obj', '/models/ATP-Synthase/ATP-Synthase_d0.01.obj']
  const synthaseGeoms = await Promise.all(synthaseModels.map(model => OBJLoaderAsync(model)))

  const atpScale = 0.5
  const lod = makeLOD({
    meshes: synthaseGeoms.map(geom => constructDimer(geom)),
    distances: [0.2, 0.21].map(num => num*atpScale)
  })
  lod.scale.set(1*atpScale, 1*atpScale, 1*atpScale)
  lod.position.set(0, 0, 1)
  lod.updateMatrix()

  scene.add(lod)
  lods.push(lod)

  const attachSynthases = (dimer) => {
    pinchesBoxes.forEach( (bbox) => {
      // Bounding box around curved section
      const curvedHelper = bbox
      // scene.add(curvedHelper)

      // Pull out position and scale of curved section
      const curvedPosition = curvedHelper.position
      const curvedScale = curvedHelper.scale

      // const dimer = crudeDimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator())
      // TODO rotate from center of group
      dimer.rotation.y = Math.PI/2
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

      let currentSpot = -curvedScale.y + dimerScale.y + 0.005
      while (currentSpot <= curvedScale.y/4 - dimerScale.y*5) {
        const anotherDimer = dimer.clone()
        // anotherDimer.position.set(-0.983, currentSpot, -0.02)
        anotherDimer.position.set(curvedPosition.x - curvedScale.x/2 + 0.0125, currentSpot, curvedPosition.z + 0.025)
        lods.push(anotherDimer)
        scene.add(anotherDimer)

        currentSpot += dimerScale.y*1.5
      }
    })
  }

  attachSynthases(lod)
}




init()

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const clock = new THREE.Clock()

const stats = createStats()
const render = () => {
  stats.begin()

  // const delta = clock.getDelta()

  for (let keyframe of keyframes) {
    keyframe()
  }

  for (let lod of lods) {
    lod.update(camera)
  }

  // controls.update(delta*0.1)
  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
