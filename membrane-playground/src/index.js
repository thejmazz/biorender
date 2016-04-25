'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x393939,
  antialias: true,
  size: 1
})
window.scene = scene

// ===========================================================================

camera.position.set(0, 1, 0)

// Cam




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

// === IMPORTS ===

import { OBJLoaderAsync, textureLoader } from './lib/loaders.js'
import { makeLOD } from './lib/lod.js'
import { populateMembrane, getBBoxDimensions } from './lib/geometry-utils.js'

import {
  crudeSynthaseCreator,
  crudeDimerCreator,
  dimerCreator,
  constructSynthase,
  constructDimer
} from './scene/meshes/atp-synthase.js'

import { constructCristae } from './scene/meshes/cristae.js'
import { constructETC } from './scene/meshes/etc.js'
import { constructETC2 } from './scene/meshes/etc-centered.js'
import { constructPorin } from './scene/meshes/porin.js'

import { randMaterial } from './lib/material-utils.js'

// === CONSTANTS ===

import { TWOPI, Y_AXIS } from './lib/constants.js'

// === FUNCTIONS ===

const rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const mesh = (geometry, materials) => {
  if (Array.isArray(materials)) {
    return new THREE.SceneUtils.createMultiMaterialObject(geometry, materials)
  } else {
    return new THREE.Mesh(geometry, materials)
  }
}

const getChildIndexByName = (name, group) => {
  group.children.forEach( (child, i) => {
    console.log(child.name, name)
    if (child.name === name) {
      return i
    }
  })

  return -1
}

// === LOADERS ===

const OBJLoader = new THREE.OBJLoader()

// === CONTROLS ===
const controls = new THREE.OrbitControls(camera, renderer.domElement)
// const controls = new THREE.FlyControls(camera)
// controls.movementSpeed = 5 //0.5
// controls.domElement = renderer.domElement
// controls.rollSpeed = (Math.PI / 6)*10
// controls.autoForward = false
// controls.dragToLook = false

// === INIT METHODS ===

const initGlobalLights = () => {
  const cLight = new THREE.PointLight(0xffffff, 1, 500)
  camera.add(cLight)
  cLight.position.set(0,0,-0.001)

  camera.lookAt(new THREE.Vector3(0,0,0))
  scene.add(camera)

  const aLight = new THREE.AmbientLight(0xe6e6e6, 0.5)
  scene.add(aLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 10),
    new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
  )
}

let topLayer
const initMembrane = (length, width, thickness, useWireframe=true) => {
  const planeGeom = new THREE.PlaneGeometry(length, width, length, width)
  const mat = new THREE.MeshLambertMaterial({color: 0xbababa, side: THREE.DoubleSide})
  const wireframe = new THREE.MeshBasicMaterial({color: 0xaaaaaa, wireframe: true})

  let materials
  if (useWireframe) {
    materials = [mat, wireframe]
  } else {
    materials = mat
  }

  topLayer = mesh(planeGeom, materials)
  topLayer.rotation.x = Math.PI/2
  topLayer.position.set(0, thickness/2, 0)
  scene.add(topLayer)

  const bottomLayer = topLayer.clone()
  bottomLayer.rotation.x = Math.PI/2
  bottomLayer.position.set(0, -(thickness/2), 0)
  scene.add(bottomLayer)
}

const initVesicle = ({radius=50, thickness=4, name}) => {
  const baseName = `${name}_membrane`

  const innerLayer = new THREE.Mesh(
    new THREE.SphereGeometry(radius - thickness/2, 32, 32, 0, TWOPI, 0, TWOPI),
    new THREE.MeshLambertMaterial({
      color: 0x2f81db,
      transparent: true,
      opacity: 0.6
    })
  )
  innerLayer.name = `${baseName}_inner`

  const outerLayer = new THREE.Mesh(
    new THREE.SphereGeometry(radius + thickness/2, 32, 32, 0, TWOPI, 0, TWOPI),
    new THREE.MeshLambertMaterial({
      color: 0x2f81db,
      transparent: true,
      opacity: 0.6
    })
  )
  outerLayer.name = `${baseName}_outer`

  const vesicle = new THREE.Group()
  vesicle.add(innerLayer)
  vesicle.add(outerLayer)
  vesicle.name = baseName
  vesicle.userData.thickness = thickness

  return vesicle
}

let pinchesBoxes = []
let wallsBoxes = []
let walls = []
async function makePiecesMito() {
  const mitochondria = await OBJLoaderAsync('/models/Mitochondria/mitochondria.obj')

  let pinches = []
  let desiredWidth = 1500
  let scale

  let outerMembrane, base

  for (let i=1; i < mitochondria.children.length; i++) {
    const mesh = mitochondria.children[i]

    const name = mesh.name.replace(/Cube\.\d+_?/, '')

    if (name.indexOf('Pinch') !== -1) {
      // console.log('pinch: ', name)
      pinches.push(mesh)
    } else if (name.indexOf('Wall') !== -1) {
      // console.log('wall: ', name)
      mesh.geometry = (new THREE.Geometry()).fromBufferGeometry(mesh.geometry)
      walls.push(mesh)
    } else if (name.indexOf('Membrane.Outer') !== -1) {
      // console.log('outer membrane: ', name)
      outerMembrane = mesh
      const bbox = getBBoxDimensions(outerMembrane.geometry)
      scale = desiredWidth / bbox.width
    } else if (name.indexOf('Base') !== -1) {
      // console.log('base: ', name)
      base = mesh
    } else {
      console.log('else: ', name)
    }
  }

  console.log(scale)

  pinches.forEach( (mesh) => {
    // scene.add(mesh)
    const bbox = new THREE.BoundingBoxHelper(mesh, 0x000000)
    bbox.update()
    pinchesBoxes.push(bbox)
    // scene.add(bbox)

    mesh.material = randMaterial()
    mesh.scale.set(scale, scale, scale)
    scene.add(mesh)
  })

  walls.forEach( (wall) => {
    wall.material = randMaterial()
    wall.scale.set(scale, scale, scale)
    scene.add(wall)

    const bbox = new THREE.BoundingBoxHelper(wall, 0x000000)
    bbox.update()
    wallsBoxes.push(bbox)
    // scene.add(bbox)
  })

  outerMembrane.material = randMaterial({transparency: true})
  outerMembrane.scale.set(scale, scale, scale)
  scene.add(outerMembrane)

  base.material = randMaterial()
  base.scale.set(scale, scale, scale)
  scene.add(base)
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

const useWalls = (walls) => {
  // for (let i=0; i < walls.length; i++) {
  //   console.log(walls[i])
  // }

  const sphereHelp = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    randMaterial()
  )
  const wall = walls[17]
  // console.log(wall)
  const pos = wall.geometry.vertices[0]
  pos.x = pos.x * wall.scale.x
  pos.y = pos.y * wall.scale.y
  pos.z = pos.z * wall.scale.x

  sphereHelp.position.set(pos.x, pos.y, pos.z)
  scene.add(sphereHelp)

  const threshold = 0.01
  for (let i=0; i < wall.geometry.faces.length; i++) {
    const face = wall.geometry.faces[i]

    if (face.normal.x > 1 - threshold && face.normal.x < 1 +  threshold) {
      // console.log(face)
      const aSphere = sphereHelp.clone()
      const aVert = (new THREE.Vector3()).copy(wall.geometry.vertices[face.a])
      aVert.x = aVert.x * wall.scale.x
      aVert.y = aVert.y * wall.scale.y
      aVert.z = aVert.z * wall.scale.x
      aSphere.material = randMaterial()
      aSphere.position.set(aVert.x, aVert.y, aVert.z)
      scene.add(aSphere)
    }
  }
}

let vesicle, ETC
async function init() {
  initGlobalLights()
  initMembrane()

  const membraneDimensions = {
    x: 100,
    y: 100,
    thickness: 4,
    padding: 0,
  }

  const { x, y, thickness, padding } = membraneDimensions

  vesicle = initVesicle({name: 'test-vesicle'})
  // console.log(getChildIndexByName('Inner-Membrane', vesicle))

  // const objy = new THREE.Mesh(new THREE.TorusGeometry( 10, 3, 16, 100 ), randMaterial())

  const porin = constructPorin(await OBJLoaderAsync('/models/Mitochondria/Outer-Membrane/porin.obj'))
  // scene.add(porin)
  const etc2 = constructETC2(await OBJLoaderAsync('/models/ETC/ETC-centered.obj'))
  etc2.position.set(0, 2, 0)
  scene.add(etc2)

  const objy = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 5), randMaterial())
  console.time('goblinFill')
  const innerMembraneProteins = populateMembrane(vesicle, etc2, 'outer')
  console.timeEnd('goblinFill')
  // scene.add(innerMembrane)
  // scene.add(vesicle)
  // scene.add(innerMembraneProteins)

  // await makeUnifiedMito()
  await makePiecesMito()

  useWalls(walls)
}

init()


// ===========================================================================

// window.capturer = new CCapture( { format: 'gif', workersPath: 'js/workers' } )
// window.capturer = new CCapture({format: 'png'})

const clock = new THREE.Clock()

window.capturerGo = -1
const stats = createStats()
const render = () => {
  stats.begin()

  // const delta = clock.getDelta()
  // innerMembrane.rotation.y = innerMembrane.rotation.y + delta*0.4
  // innerMembrane.rotation.z = innerMembrane.rotation.z + delta*0.4
  // innerMembrane.rotation.x = innerMembrane.rotation.x + delta*0.4

  // if (innerMembrane.rotation.y % TWOPI > 0 && innerMembrane.rotation.y % TWOPI < 0.01 &&
  //     innerMembrane.rotation.z % TWOPI > 0 && innerMembrane.rotation.z % TWOPI < 0.01 &&
  //     innerMembrane.rotation.x % TWOPI > 0 && innerMembrane.rotation.x % TWOPI < 0.01 &&
  //     (capturerGo === 0 || capturerGo === 1)
  // ) {
  //   if (capturerGo === 0) {
  //     capturerGo++
  //     console.log('starting')
  //     capturer.start()
  //   } else if (capturerGo === 1) {
  //     capturerGo++
  //     console.log('ending')
  //     capturer.stop()
  //     capturer.save()
  //   }
  //   console.log('full Y')
  // }

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
