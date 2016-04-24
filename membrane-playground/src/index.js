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

import { OBJLoaderAsync, textureLoader } from './lib/loaders.js'
import { makeLOD } from './lib/lod.js'
import { flatUIHexColors, generateShades } from './lib/colour-utils.js'
import { getBBoxDimensions, getBoundingRadius } from './lib/geometry-utils.js'

import {
  crudeSynthaseCreator,
  crudeDimerCreator,
  dimerCreator,
  constructSynthase,
  constructDimer
} from './scene/meshes/atp-synthase.js'

import { constructCristae } from './scene/meshes/cristae.js'
import { constructETC } from './scene/meshes/etc.js'
import { constructPorin } from './scene/meshes/porin.js'

// === CONSTANTS ===

const TWOPI = Math.PI*2
const Y_AXIS = new THREE.Vector3(0, 1, 0)

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

const initVesicle = ({radius=50, thickness=20}) => {
  const innerMembrane = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32, 0, TWOPI, 0, TWOPI),
    new THREE.MeshLambertMaterial({
      color: 0x2f81db,
      transparent: true,
      opacity: 0.6
    })
  )

  return innerMembrane
}


const fillWithGoblin = (mesh, block, offset) => {
  // if (block instanceof THREE.Group) {
  //
  // }

  const octree = new THREE.Octree()
  const verts = mesh.geometry.vertices
  const faces = mesh.geometry.faces
  const bbox = getBBoxDimensions(block.geometry)
  const boundingRadius = getBoundingRadius(block.geometry)
  // uses half dimensions
  const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(bbox.width/2, bbox.height/2, bbox.depth/2))



  // Array of previously used bounding boxes
  let addedBlocks = []
  // Group to build
  const proteins = new THREE.Group()

  const addNewBox = (goblinBox) => {
    const vert = goblinBox.position
    const { x, y, z, w } = goblinBox.rotation
    const { half_width, half_height, half_depth } = goblinBox.shape

    const newBlock = new Goblin.RigidBody(new Goblin.BoxShape(half_width, half_height, half_depth))
    newBlock.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
    newBlock.rotation.set(x, y, z, w)
    newBlock.updateDerived()

    addedBlocks.push(newBlock)

    octree.add({x: vert.x, y: vert.y, z: vert.z, radius: 4, id: addedBlocks.length - 1})
    octree.update()

    const newProtein = block.clone()
    newProtein.material = randMaterial()
    newProtein.position.set(vert.x, vert.y, vert.z)
    newProtein.rotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w))

    // console.log(newProtein.rotation)
    // newProtein.rotation.y = Math.PI/4

    proteins.add(newProtein)
  }

  // for (let i=0; i < faces.length; i++) {
  //   const { a, b, c, vertexNormals } = faces[i]
  //
  //   const faceVerts = [verts[a], verts[b], verts[c]].map( (vert, i) => {
  //     // const v = (new THREE.Vector3(vert.x, verts.y, verts.z)).applyEuler(mesh.rotation)
  //     // v.x = v.x + mesh.position.x
  //     // v.y = v.y + mesh.position.y
  //     // v.z = v.z + mesh.position.z
  //
  //     const obj = {
  //       vert,
  //       normal: vertexNormals[i]
  //     }
  //
  //     return obj
  //   })
  //
  //   if (i === 0) {
  //     console.log(faceVerts)
  //   }
  // }


  for (let i=0; i < verts.length; i+= 1) {
    // Rotate and realign vertex
    const vert = (new THREE.Vector3(verts[i].x, verts[i].y, verts[i].z)).applyEuler(mesh.rotation)
    vert.x = vert.x + mesh.position.x
    vert.y = vert.y + mesh.position.y
    vert.z = vert.z + mesh.position.z

    const direction = (new THREE.Vector3())
      .copy(vert)
      .sub(mesh.position)
      .normalize()

    vert.x = vert.x + offset*direction.x
    vert.y = vert.y + offset*direction.y
    vert.z = vert.z + offset*direction.z

    // Get angle from mesh position to this vertex
    const quat = (new THREE.Quaternion()).setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      (new THREE.Vector3()).copy(vert).normalize()
    )

    quat.multiply((new THREE.Quaternion()).setFromAxisAngle(Y_AXIS, Math.random()*Math.PI))

    // Update goblinBox position to current vertex
    goblinBox.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
    goblinBox.rotation.set(quat.x, quat.y, quat.z, quat.w)
    goblinBox.updateDerived()

    // Look for collisions in nearby area using octree search
    const searchResults = octree.search(new THREE.Vector3(vert.x, vert.y, vert.z), boundingRadius*2)
    let noCollisions = true
    for (let j=0; j < searchResults.length; j++) {
      const collidee = addedBlocks[searchResults[j].object.id]
      const contact = Goblin.GjkEpa.testCollision(goblinBox, collidee)

      if (contact !== undefined) {
        noCollisions = false
        break
      }
    }

    if (noCollisions || addedBlocks.length === 0) {
      addNewBox(goblinBox)
    }
  }

  return proteins
}

let innerMembrane, ETC
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

  innerMembrane = initVesicle({})

  // const objy = new THREE.Mesh(new THREE.TorusGeometry( 10, 3, 16, 100 ), randMaterial())

  const porin = constructPorin(
    await OBJLoaderAsync('/models/Mitochondria/Outer-Membrane/porin.obj'),
    await OBJLoaderAsync('/models/Mitochondria/Outer-Membrane/porin-unified.obj')
  )
  scene.add(porin)

  const objy = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 5), randMaterial())
  console.time('goblinFill')
  const innerMembraneProteins = fillWithGoblin(innerMembrane, objy, 10)
  console.timeEnd('goblinFill')
  scene.add(innerMembrane)
  scene.add(innerMembraneProteins)
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
