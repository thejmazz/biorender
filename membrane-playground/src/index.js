'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x393939,
  antialias: true,
  size: 1
})
window.scene = scene

// ===========================================================================

camera.position.set(0,75,0)

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
import { flatUIHexColors, generateShades } from './lib/colour-utils.js'

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

const mesh = (geometry, materials) => {
  if (Array.isArray(materials)) {
    return new THREE.SceneUtils.createMultiMaterialObject(geometry, materials)
  } else {
    return new THREE.Mesh(geometry, materials)
  }
}

const randMaterial = () => {
  return new THREE.MeshLambertMaterial({
    color: flatUIHexColors[Math.floor(Math.random()*flatUIHexColors.length)],
    transparent: true,
    opacity: 0.6
  })
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
  const cLight = new THREE.PointLight(0xffffff, 1, 50)
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

const fillWithGoblin = (mesh) => {
  const verts = mesh.geometry.vertices

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshLambertMaterial({color: 0xd990c4})
  )

  let addedBlocks = []
  // uses half dimensions
  let currentBlock = new Goblin.RigidBody(new Goblin.BoxShape(2, 3, 2))
  let stopForever = false
  for (let i=0; i < verts.length; i+= 1) {
    // Rotate and realign vertex
    const vert = (new THREE.Vector3(verts[i].x, verts[i].y, verts[i].z)).applyEuler(mesh.rotation)
    vert.x = vert.x + mesh.position.x
    vert.y = vert.y + mesh.position.y
    vert.z = vert.z + mesh.position.z

    // const vertSphere = sphere.clone()
    // if (i % 4 === 0) {
    //   vertSphere.material = new THREE.MeshLambertMaterial({color: 0x1a22ee})
    // }
    // vertSphere.position.set(vert.x, vert.y, vert.z)
    // scene.add(vertSphere)

    // const goblinVert = new Goblin.Vector3(vert.x, vert.y, vert.z)
    // currentBlock.position = goblinVert
    // currentBlock.updateDerived()

    const contacts = []
    let noCollisions = true
    for (let j=0; j < addedBlocks.length; j++) {
      const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2))
      goblinBox.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
      goblinBox.updateDerived()

      const collidee = new Goblin.RigidBody(new Goblin.BoxShape(2, 3, 2))
      collidee.position = addedBlocks[j]
      collidee.updateDerived()

      const contactDetails = Goblin.GjkEpa.testCollision(goblinBox, collidee)

      // contacts.push(contactDetails === undefined)
      if (contactDetails !== undefined) {
        noCollisions = false
      }
    }

    if (noCollisions) {
      const newBlock = new Goblin.RigidBody(new Goblin.BoxShape(2, 3, 2))
      newBlock.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
      newBlock.updateDerived()

      addedBlocks.push(newBlock.position)

      const newProtein = new THREE.Mesh(
        new THREE.BoxGeometry(4, 6, 4),
        randMaterial()
      )
      newProtein.position.set(vert.x, vert.y, vert.z)

      scene.add(newProtein)
    }

    if (addedBlocks.length === 0) {
      const newBlock = new Goblin.RigidBody(new Goblin.BoxShape(2, 3, 2))
      newBlock.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
      newBlock.updateDerived()

      addedBlocks.push(newBlock.position)

      const newProtein = new THREE.Mesh(
        new THREE.BoxGeometry(4, 6, 4),
        randMaterial()
      )
      newProtein.position.set(vert.x, vert.y, vert.z)

      scene.add(newProtein)
    }

    if (stopForever) {
      break
    }
  }
}

let box, wall, caster

let box1, box2, box3
async function init() {
  initGlobalLights()

  const membraneDimensions = {
    x: 50,
    y: 50,
    thickness: 4,
    padding: 0,
  }

  const { x, y, thickness, padding } = membraneDimensions

  initMembrane(x + padding, y + padding, thickness, false)

  console.time('goblinFill')
  fillWithGoblin(topLayer)
  console.timeEnd('goblinFill')
}

init()

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const clock = new THREE.Clock()

const stats = createStats()
const render = () => {
  stats.begin()

  // const delta = clock.getDelta()
  // updateBox(delta, {maxX: 50, minX: -50, maxZ: 50, minZ: -50})

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
