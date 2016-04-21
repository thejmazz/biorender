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

const TMProteinBox = new THREE.BoxBufferGeometry(4, 6, 4)
const TMProtein = (w, d) => {
  return mesh(
    TMProteinBox,
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

const fillWithRays = (mesh) => {
  let caster = new THREE.Raycaster()

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshLambertMaterial({color: flatUIHexColors[Math.floor(Math.random()*flatUIHexColors.length)]})
  )
  box.scale.set(4, 6, 4)
  scene.add(box)
  let watching = [box]

  const rays = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, 1, -1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, 1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(-1, -1, -1)
  ]

  const getAvailableVertices = () => {
    let availables = []

    for (let i=0; i < mesh.geometry.vertices.length; i+=99) {
      const vert = mesh.geometry.vertices[i]

      for (let j=0; j < rays.length; j++) {
        const ray = rays[j]

        // console.log(vert, ray)
        caster.set(vert, ray)
        const collisions = caster.intersectObjects(scene.children)
        // TODO proper distancing for different rays
        if (collisions.length > 0 && collisions[0].distance <= box.scale.x/2) {
          availables.push(vert)
        }
      }
    }

    return availables
  }

  let counter = 10
  while (counter > 0) {
    const availableVerts = getAvailableVertices()
    console.log(availableVerts.length)
    const pos = availableVerts[Math.floor(Math.random()*availableVerts.length)]

    const newBox = box.clone()
    newBox.position.set(pos.x, 0, pos.y)
    watching.push(newBox)
    scene.add(newBox)

    counter--
  }
}

let box, wall, caster

let box1, box2, box3
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

  const boxGeom = new THREE.BoxGeometry(1,1,1)
  const randFlatUILambert = () => {
    return new THREE.MeshLambertMaterial({color: flatUIHexColors[Math.floor(Math.random()*flatUIHexColors.length)]})
  }



  box1 = new THREE.Mesh(boxGeom, new THREE.MeshLambertMaterial({color: flatUIHexColors[3]}))
  box1.scale.set(4,6,4)
  scene.add(box1)


  box2 = new THREE.Mesh(boxGeom, new THREE.MeshLambertMaterial({color: flatUIHexColors[7]}))
  box2.scale.set(4,6,4)
  box2.position.set(10,0,0)

  scene.add(box2)

  box3 = new THREE.Mesh(boxGeom, new THREE.MeshLambertMaterial({color: flatUIHexColors[10]}))
  box3.scale.set(4,6,4)
  box3.position.set(2,0,2)

  scene.add(box3)

  console.time('makingGoblin')
  box1.goblin = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2),1)
  box2.goblin = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2),1)
  box3.goblin = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2),1)
  console.timeEnd('makingGoblin')

  console.time('settingGoblinPositions')
  box1.goblin.position = new Goblin.Vector3(0, 0, 0)
  box2.goblin.position = new Goblin.Vector3(10, 0, 0)
  box3.goblin.position = new Goblin.Vector3(2, 0, 2)
  console.timeEnd('settingGoblinPositions')

  console.time('updateDerived')
  box1.goblin.updateDerived()
  box2.goblin.updateDerived()
  box3.goblin.updateDerived()
  console.timeEnd('updateDerived')

  let contact
  console.time('testContact')
  // box1 and box2 dont collide
  contact = Goblin.GjkEpa.testCollision(box1.goblin, box2.goblin)
  console.log(contact)
  console.timeEnd('testContact')

  console.time('testContact')
  // box1 and box3 do collide
  contact = Goblin.GjkEpa.testCollision(box1.goblin, box3.goblin)
  console.log(contact)
  console.timeEnd('testContact')

  console.log('============================================================')

  // Assumes for a set of intersection comparisons, we will compare one box
  // (goblinBox), to an array of other boxes. So creating this box is
  // irrelevant when there are 10s of other boxes to test collision with.
  const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2))
  goblinBox.position = new Goblin.Vector3(0, 0, 0)
  goblinBox.updateDerived()
  let collidee, contactDetails

  console.time('goblinRunNoCollision')
  collidee = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2))
  collidee.position = new Goblin.Vector3(10, 0, 0)
  collidee.updateDerived()
  contactDetails = Goblin.GjkEpa.testCollision(goblinBox, collidee)
  console.log(contactDetails === undefined ? 'No Collision' : 'Collision')
  console.timeEnd('goblinRunNoCollision')

  console.time('goblinRunWithCollision')
  collidee = new Goblin.RigidBody(new Goblin.BoxShape(2,3,2))
  collidee.position = new Goblin.Vector3(2, 0, 0)
  collidee.updateDerived()
  contactDetails = Goblin.GjkEpa.testCollision(goblinBox, collidee)
  console.log(contactDetails === undefined ? 'No Collision' : 'Collision')
  console.timeEnd('goblinRunWithCollision')

  // console.time('fillage')
  // 600 - 700 ms
  // fillRandomly(100, 100, 4, 4)

  // fillWithRays(topLayer)
  // console.timeEnd('fillage')
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
