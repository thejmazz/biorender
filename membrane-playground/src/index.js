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

const fillRandomly = (width, height, rectWidth, rectHeight) => {
  // Flag for each discretized spot
  // true if spot taken
  const flags = []
  for (let i=0; i < width; i++) {
    flags[i] = []
    for (let j=0; j < height; j++) {
      flags[i][j] = false
    }
  }

  // Check for true flags starting from top left in 2d array
  const checkAvailable = (x, y, w, h) => {
    if (x+w > width || y+h > height) {
      return false
    }

    for (let i=x; i < x+w; i++) {
      for (let j=y; j < y+h; j++) {
        if (flags[i][j]) {
          return false
        }
      }
    }

    return true
  }

  // Switch flags to true given a rectangles starting point and its dimensions
  const fillSpaces = (x, y, width, height) => {
    for (let i=x; i < x+width; i++) {
      for (let j=y; j < y+height; j++) {
        flags[i][j] = true
      }
    }
  }

  // Go through all available spaces for a given pair of rectangle dimensions
  // Return an array of good x,y spots. If no more spots left, array is empty.
  const getGoodSpots = (w, h) => {
    let goodSpots = []

    for (let i=0; i < width; i++) {
      for (let j=0; j < height; j++) {
        if (!flags[i][j]) {
          if (checkAvailable(i, j, w, h)) {
            goodSpots.push([i, j])
            goodSpots.push({x: i, y: j})
          }
        }
      }
    }

    return goodSpots
  }

  // Add rectangles until we cant
  let spots = getGoodSpots(rectWidth, rectHeight)
  while (spots.length > 0) {
    // Can probably just take spots[0] here,
    // maybe not look as random?
    const spot = spots[Math.floor(Math.random()*spots.length)]

    // Switch flags
    fillSpaces(spot.x, spot.y, rectWidth, rectHeight)

    // Add mesh to scene
    const protein = TMProtein(rectWidth,rectHeight)
    protein.position.set(spot.x - width/2 + rectWidth/2, 0, spot.y - height/2 + rectHeight/2)
    scene.add(protein)

    spots = getGoodSpots(rectWidth, rectHeight)
  }
}


async function init() {
  initGlobalLights()

  const membraneDimensions = {
    x: 100,
    y: 100,
    thickness: 4,
    padding: 0,
  }

  const { x, y, thickness, padding } = membraneDimensions

  initMembrane(x + padding, y + padding, thickness, false)

  fillRandomly(100, 100, 4, 4)
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
