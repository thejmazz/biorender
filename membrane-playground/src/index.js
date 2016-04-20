'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0x393939,
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

  camera.position.set(0, 55, 80)
  camera.lookAt(new THREE.Vector3(0,0,0))
  scene.add(camera)

  const aLight = new THREE.AmbientLight(0xe6e6e6, 0.5)
  scene.add(aLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 10),
    new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
  )
}

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

  const topLayer = mesh(planeGeom, materials)
  topLayer.rotation.x = Math.PI/2
  topLayer.position.set(0, thickness/2, 0)
  scene.add(topLayer)

  const bottomLayer = topLayer.clone()
  bottomLayer.rotation.x = Math.PI/2
  bottomLayer.position.set(0, -(thickness/2), 0)
  scene.add(bottomLayer)
}

const TMProtein = (w, d) => {
  return mesh(
    new THREE.BoxGeometry(w, 6, d),
    new THREE.MeshLambertMaterial({color: flatUIHexColors[rand(0, flatUIHexColors.length-1)]})
  )
}


async function init() {
  initGlobalLights()

  const membraneDimensions = {
    x: 100,
    y: 100,
    thickness: 4,
    padding: 2,
  }

  const { x, y, thickness, padding } = membraneDimensions

  initMembrane(x + padding, y + padding, thickness, true)

  const fills = []
  for (let i=0; i<100; i++) {
    for (let j=0; j<100; j++) {
      fills.push([i, j])
    }
  }

  // true if spot taken
  const flags = []
  for (let i=0; i<100; i++) {
    flags[i] = []
    for (let j=0; j<100; j++) {
      flags[i][j] = false
    }
  }

  const checkAvailable = (x, y, width, height) => {
    for (let i=x; i<x+width; i++) {
      for (let j=y; j<y+height; j++) {
        if (flags[i][j]) {
          return false
        }
      }
    }
    return true
  }

  let fillsCounter = fills.length
  while (fillsCounter > 0) {
    const randomPoint = fills[Math.floor(Math.random()*fillsCounter)]

    if (checkAvailable(randomPoint[0], randomPoint[1], 4, 4) && randomPoint[0] < 100-4 && randomPoint[1] < 100-4) {
      flags[randomPoint[0]][randomPoint[1]] = true
      flags[randomPoint[0]+1][randomPoint[1]] = true
      flags[randomPoint[0]+2][randomPoint[1]] = true
      flags[randomPoint[0]+3][randomPoint[1]] = true

      flags[randomPoint[0]+1][randomPoint[1]+1] = true
      flags[randomPoint[0]+2][randomPoint[1]+1] = true
      flags[randomPoint[0]+3][randomPoint[1]+1] = true

      flags[randomPoint[0]+1][randomPoint[1]+2] = true
      flags[randomPoint[0]+2][randomPoint[1]+2] = true
      flags[randomPoint[0]+3][randomPoint[1]+2] = true

      flags[randomPoint[0]+1][randomPoint[1]+3] = true
      flags[randomPoint[0]+2][randomPoint[1]+3] = true
      flags[randomPoint[0]+3][randomPoint[1]+3] = true

      const protein = TMProtein(4,4)
      protein.position.set(randomPoint[0]-50+2, 0, randomPoint[1]-50+2)
      scene.add(protein)
    }



    fillsCounter--
  }

  // for (let i=0; i<fills.length; i++) {
  //   const protein = TMProtein(1,1)
  //   protein.position.set(fills[i][0]-50+0.5, 0, fills[i][1]-50+0.5)
  //
  //   scene.add(protein)
  // }
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
