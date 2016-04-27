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
import { makeLOD, preDisableDetail } from './lib/lod.js'
import { populateMembrane, getBBoxDimensions, getBoundingRadius } from './lib/geometry-utils.js'

import {
  crudeSynthaseCreator,
  crudeDimerCreator,
  dimerCreator,
  constructSynthase,
  constructSynthaseSimple,
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
// const controls = new THREE.OrbitControls(camera, renderer.domElement)
const controls = new THREE.FlyControls(camera)
controls.movementSpeed = 500 //50 //5 //0.5
controls.domElement = renderer.domElement
controls.rollSpeed = (Math.PI / 6)*10
controls.autoForward = false
controls.dragToLook = false

// === INIT METHODS ===

const initGlobalLights = () => {
  const cLight = new THREE.PointLight(0xffffff, 1, 1000)
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
      // color: 0x2f81db,
      color: 0xf7df26,
      wireframe: true,
      transparent: false,
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
let pinches = []
let outerMembrane
let rim
let base
async function makePiecesMito() {
  const mitochondria = await OBJLoaderAsync('/models/Mitochondria/mitochondria.obj')

  const triFaceMaterials = (geometry) => {
    geometry.faceVertexUvs[0] = []

    for (let i = 0; i < geometry.faces.length;  i+= 2) {

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2(0 , 0),
        new THREE.Vector2(0 , 1),
        new THREE.Vector2(1 , 0),
      ])

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2(0 , 1),
        new THREE.Vector2(1 , 1),
        new THREE.Vector2(1 , 0),
      ])
    }

    geometry.uvsNeedUpdate = true
  }

  let desiredWidth = 3000
  let scale

  for (let i=1; i < mitochondria.children.length; i++) {
    const mesh = mitochondria.children[i]

    const name = mesh.name.replace(/Cube\.\d+_?/, '')
    // console.log(name)

    if (name.indexOf('Pinch') !== -1) {
      // console.log('pinch: ', name)
      mesh.geometry = (new THREE.Geometry()).fromBufferGeometry(mesh.geometry)
      triFaceMaterials(mesh.geometry)
      pinches.push(mesh)
    } else if (name.indexOf('Wall') !== -1) {
      // console.log('wall: ', name)
      mesh.geometry = (new THREE.Geometry()).fromBufferGeometry(mesh.geometry)
      triFaceMaterials(mesh.geometry)
      walls.push(mesh)
    } else if (name.indexOf('Membrane.Outer') !== -1) {
      mesh.geometry = (new THREE.Geometry()).fromBufferGeometry(mesh.geometry)
      triFaceMaterials(mesh.geometry)
      // console.log('outer membrane: ', name)
      outerMembrane = mesh
      const bbox = getBBoxDimensions(outerMembrane.geometry)
      scale = desiredWidth / bbox.width
    } else if (name.indexOf('Base') !== -1) {
      mesh.geometry = (new THREE.Geometry()).fromBufferGeometry(mesh.geometry)
      triFaceMaterials(mesh.geometry)
      // console.log('base: ', name)
      base = mesh
    } else if (name.indexOf('RIM') !== -1) {
      mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry)

      triFaceMaterials(mesh.geometry)

      // mesh.material = faceMat
      // mesh.material = new THREE.MeshNormalMaterial()
      rim = mesh
    } else {
      console.log('else: ', name)
    }
  }

  // console.log(scale)

  pinches.forEach( (mesh) => {
    // scene.add(mesh)
    const bbox = new THREE.BoundingBoxHelper(mesh, 0x000000)
    bbox.update()
    pinchesBoxes.push(bbox)
    // scene.add(bbox)

    mesh.material = randMaterial()
    mesh.scale.set(scale, scale, scale)
    // scene.add(mesh)
  })

  walls.forEach( (wall) => {
    wall.material = randMaterial()
    // wall.material.wireframe = true
    wall.scale.set(scale, scale, scale)
    // scene.add(wall)

    // const bbox = new THREE.BoundingBoxHelper(wall, 0x000000)
    // bbox.update()
    // wallsBoxes.push(bbox)
    // scene.add(bbox)
  })

  outerMembrane.material = randMaterial({transparency: true})
  outerMembrane.scale.set(scale, scale, scale)
  // scene.add(outerMembrane)

  base.material = randMaterial()
  base.scale.set(scale, scale, scale)
  // scene.add(base)

  // rim.material = new THREE.MeshPhongMaterial({map: phosphosTexture, bumpMap: phosphosBump})
  rim.scale.set(scale, scale, scale)
  // scene.add(rim)
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

let etc2, etc2med, etc2low
const useWalls = ({walls, lods}) => {
  // const wall = walls[17]
  // console.log(etc2med)
  // console.log(etc2low)

  const radius = getBoundingRadius(etc2.geometry)
  const bbox = new THREE.BoundingBoxHelper(etc2)
  bbox.update()

  const etcBox = new THREE.Mesh(
    new THREE.BoxBufferGeometry(bbox.scale.x, bbox.scale.y, bbox.scale.z),
    randMaterial()
  )

  const doWall = (wall) => {
    wall.userData.thickness = 4
    wall.geometry.computeBoundingBox()
    const { max, min } = wall.geometry.boundingBox
    const yThreshold = max.y - (max.y - min.y)*0.05
    const etcs = populateMembrane(wall, etc2, 'outer', (vert) => {
      return vert.y < yThreshold
    })

    for (let j=0; j < etcs.children.length; j++) {
      const child = etcs.children[j]

      const etcBox2 = etcBox.clone()
      etcBox2.material = child.material
      etcBox2.visible = false

      const etcMed = etc2med.clone()
      etcMed.material = child.material
      etcMed.rotation.setFromQuaternion(child.quaternion)

      const etcLow = etc2low.clone()
      etcLow.material = child.material
      etcLow.rotation.setFromQuaternion(child.quaternion)

      const etcLOD = makeLOD({
        meshes: [child, etcMed, etcLow, new THREE.Object3D()],
        distances: [1, 2, 4, 20].map(num => radius*num)
      })
      etcLOD.position.set(child.position.x, child.position.y, child.position.z)
      child.position.set(0, 0, 0)
      etcLOD.updateMatrix()
      lods.push(etcLOD)
      preDisableDetail(etcLOD)
      scene.add(etcLOD)
    }
  }

  // doWall(wall)

  for (let i=0; i < walls.length; i++) {
    const wall = walls[i]

    doWall(wall)
  }
}

// let ATPSynthase
let ATPSynthaseMed, ATPSynthaseLow
const usePinch = ({pinches, ATPSynthase, lods, lodOctree}) => {
  const parentDimer = dimerCreator({synthase: ATPSynthase})
  const parentDimerMed = dimerCreator({synthase: ATPSynthaseMed})
  const parentDimerLow = dimerCreator({synthase: ATPSynthaseLow})

  // use max z factor from normals on 90% of z of mesh to determine which way its pointing
  // kinda sketchy. will only work if mito is in left-right. after this, you can rotate.
  const getSidedness = (pinch) => {
    const bbox = getBBoxDimensions(pinch.geometry)
    const zThreshold = pinch.geometry.boundingBox.min.z + bbox.depth*0.9
    const faces = pinch.geometry.faces
    const verts = pinch.geometry.vertices

    let maxZNorm = faces[0].normal.z
    for (let i=1; i < faces.length; i++) {
      const face = faces[i]

      if (verts[face.a].z > zThreshold && verts[face.b].z > zThreshold && verts[face.c].z > zThreshold) {
        if (face.normal.z > maxZNorm) {
          maxZNorm = face.normal.z
        }
      }
    }

    let side
    if (maxZNorm < 0) {
      side = 'away'
    } else if (maxZNorm > 0) {
      side = 'towards'
    }

    return side
  }


  const doPinch = ({pinch, side}) => {
    const bbox = getBBoxDimensions(pinch.geometry)
    const yThreshold = pinch.geometry.boundingBox.max.y - bbox.height/2

    let min = null
    let max = null
    // assumes up. assumes left-right.
    const verts = pinch.geometry.vertices
    for (let i=0; i < verts.length; i++) {
      const vert = verts[i]

      if (vert.y > yThreshold) {
        if (min === null) {
          min = new THREE.Vector3().copy(vert)
        }
        if (max === null) {
          max = new THREE.Vector3().copy(vert)
        }

        if (vert.x < min.x) {
          min.x = vert.x
        } else if (vert.x > max.x) {
          max.x = vert.x
        }

        if (vert.y < min.y) {
          min.y = vert.y
        } else if (vert.y > max.y) {
          max.y = vert.y
        }

        if (vert.z < min.z) {
          min.z = vert.z
        } else if (vert.z > max.z) {
          max.z = vert.z
        }
      }
    }

    // TODO util func for this
    // assumes equal x,y,z scaling
    max.multiplyScalar(pinch.scale.x)
    min.multiplyScalar(pinch.scale.x)

    const dimer = parentDimer.clone()
    let x = min.x + (max.x - min.x)/2
    let y = max.y
    let z
    if (side === 'towards') {
      z = max.z
      dimer.rotation.z = Math.PI/2
    } else if (side === 'away') {
      z = min.z
      dimer.rotation.z = -Math.PI/2
    }
    dimer.rotation.y = Math.PI/2

    const dimerLow = parentDimerLow.clone()
    // let x = min.x + (max.x - min.x)/2
    // let y = max.y
    // let z
    if (side === 'towards') {
      // z = max.z
      dimerLow.rotation.z = Math.PI/2
    } else if (side === 'away') {
      // z = min.z
      dimerLow.rotation.z = -Math.PI/2
    }
    dimerLow.rotation.y = Math.PI/2

    const dimerBbox = new THREE.BoundingBoxHelper(dimer)
    dimerBbox.update()

    let currentY = y

    const makeGlobalMinY = (dist, mesh) => {
      mesh.geometry.computeBoundingBox()
      const { min, max } = mesh.geometry.boundingBox

      const minY = (min.y + dist*(max.y - min.y))*mesh.scale.y

      return minY
    }

    let globalMinY = makeGlobalMinY(0.1, pinch)
    while (currentY > globalMinY) {
      const newDimer = dimer.clone()
      // newDimer.position.set(x, currentY, z)
      newDimer.material = randMaterial()
      const newDimerLow = dimerLow.clone()
      newDimerLow.material = newDimer.material

      const radius = getBoundingRadius(newDimer.geometry)
      const newDimerBox = new THREE.Mesh(
        new THREE.BoxBufferGeometry(dimerBbox.scale.x, dimerBbox.scale.y, dimerBbox.scale.z),
        randMaterial()
      )
      const dimerLOD = makeLOD({
        meshes: [newDimer, newDimerLow, new THREE.Object3D()],
        distances: [2, 3, 25].map(num => radius*num)
      })
      dimerLOD.position.set(x, currentY, z)
      dimerLOD.updateMatrix()
      lods.push(dimerLOD)
      // const { x, y, z } = dimerLOD.position
      // LODOctree.add({x, y, z, radius, id: lods.length - 1})
      preDisableDetail(dimerLOD)
      scene.add(dimerLOD)

      // newDimer.position.set(x, currentY, z)
      // scene.add(newDimer)

      currentY -= dimerBbox.scale.y*1.5
    }
  }

  for (let i=0; i < pinches.length; i++) {
    const pinch = pinches[i]
    const side = getSidedness(pinch)

    doPinch({pinch, side})
  }

  // doPinch({pinch: pinches[16], side:'away'})
  // doPinch({pinch: pinches[17], side:'towards'})
}


let vesicle, ETC, atpPivot, bboxH
let atpReady = false
let lods = []
// so we don't have to update **every** LOD **every** frame
const LODOctree = new THREE.Octree()
async function init() {
  initGlobalLights()
  initMembrane()

  const membraneDimensions = {
    x: 100,
    y: 100,
    thickness: 4,
    padding: 0,
  }

  // const { x, y, thickness, padding } = membraneDimensions

  vesicle = initVesicle({name: 'test-vesicle'})
  // console.log(getChildIndexByName('Inner-Membrane', vesicle))

  // const objy = new THREE.Mesh(new THREE.TorusGeometry( 10, 3, 16, 100 ), randMaterial())

  // scene.add(porin)
  etc2 = constructETC2(await OBJLoaderAsync('/models/ETC/etc2-0.1.obj'))
  etc2med = constructETC2(await OBJLoaderAsync('/models/ETC/etc2-0.05.obj'))
  etc2low = constructETC2(await OBJLoaderAsync('/models/ETC/etc2-0.01.obj'))
  // etc2.position.set(0, 2, 0)
  // scene.add(etc2)

  const ATPSynthase = constructSynthaseSimple(await OBJLoaderAsync('/models/ATP-Synthase/ATP-Synthase2-0.1.obj'))
  ATPSynthase.geometry.computeBoundingBox()
  // SKETCHY AF. but not needed anymore. but alternative sln. isn't exactly amazing either.
  // ATPSynthase.userData.yOffset = ATPSynthase.geometry.boundingBox.min.y*1.5 //* ATPSynthase.scale.y
  ATPSynthase.geometry.center()
  // scene.add(ATPSynthase)

  ATPSynthaseMed = constructSynthaseSimple(await OBJLoaderAsync('/models/ATP-Synthase/ATP-Synthase2-0.05.obj'))
  ATPSynthaseMed.geometry.computeBoundingBox()
  ATPSynthaseMed.geometry.center()

  ATPSynthaseLow = constructSynthaseSimple(await OBJLoaderAsync('/models/ATP-Synthase/ATP-Synthase2-0.01.obj'))
  ATPSynthaseLow.geometry.computeBoundingBox()
  ATPSynthaseLow.geometry.center()

  // const bbox = getBBoxDimensions(ATPSynthase.geometry)
  // ATPSynthase.geometry.translate(0, ATPSynthase.geometry.boundingBox.min.y, 0)
  const dimer = dimerCreator({synthase: ATPSynthase})
  // scene.add(dimer)
  const dimer2 = dimerCreator({synthase: ATPSynthase})
  dimer2.rotation.z = Math.PI/2
  dimer2.rotation.y = Math.PI/2
  // scene.add(dimer2)


  const bboxA = getBBoxDimensions(ATPSynthase.geometry)
  const atpRadius = getBoundingRadius(ATPSynthase.geometry)
  const boxy = new THREE.Mesh(
    new THREE.BoxGeometry(bboxA.width, bboxA.height, bboxA.depth),
    randMaterial()
  )
  const testLOD = makeLOD({
    meshes: [ATPSynthase, boxy],
    distances: [4, 6].map(num => atpRadius*num)
  })
  testLOD.position.set(0, -20, 0)
  testLOD.updateMatrix()
  // lods.push(testLOD)
  const { x, y, z } = testLOD.position
  LODOctree.add({x, y, z, radius: atpRadius, id: lods.length - 1})
  // LODOctree.update()
  // console.log(LODOctree.search(new THREE.Vector3().clone(testLOD.position), 100))
  // preDisableDetail(testLOD)
  // scene.add(testLOD)


  const objy = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 5), randMaterial())
  console.time('goblinFill')
  // const innerMembraneProteins = populateMembrane(vesicle, etc2, 'outer')
  console.timeEnd('goblinFill')
  // scene.add(innerMembrane)
  // scene.add(vesicle)
  // scene.add(innerMembraneProteins)

  // await makeUnifiedMito()
  await makePiecesMito()

  useWalls({walls, lods})
  usePinch({pinches, ATPSynthase, lods, lodOctree: LODOctree})

  const phosphosTexture = textureLoader.load('/textures/phospholipids/phospholipids_a.png')
  // phosphosTexture.wrapS = phosphosTexture.wrapT =  THREE.RepeatWrapping
  const phosphosBump = textureLoader.load('/textures/phospholipids/phospholipids_b.png')
  // phosphosBump.wrapS = phosphosBump.wrapT =  THREE.RepeatWrapping
  rim.material = new THREE.MeshPhongMaterial({map: phosphosTexture, bumpMap: phosphosBump})
  scene.add(rim)

  const phosphosTopTexture = textureLoader.load('/textures/phospholipids-top/phospholipids-top_a.png')
  const phosphosTopBump = textureLoader.load('/textures/phospholipids-top/phospholipids-top_b.png')
  const wallMat = new THREE.MeshPhongMaterial({map: phosphosTopTexture, bumpMap: phosphosTopBump, side: THREE.DoubleSide})
  walls.forEach( (wall) => {
    wall.material = wallMat
    scene.add(wall)
  })

  pinches.forEach( (pinch) => {
    pinch.material = wallMat
    scene.add(pinch)
  })

  base.material = wallMat
  scene.add(base)
  outerMembrane.material = wallMat.clone()
  outerMembrane.material.transparent = true
  outerMembrane.material.opacity = 0.5
  scene.add(outerMembrane)

  const porin = constructPorin(await OBJLoaderAsync('/models/Mitochondria/Outer-Membrane/porin.obj'))
  // const porins = populateMembrane(outerMembrane, porin, 'outer')
  // scene.add(porins)
}

init()


// ===========================================================================

// window.capturer = new CCapture( { format: 'gif', workersPath: 'js/workers' } )
// window.capturer = new CCapture({format: 'png'})

const clock = new THREE.Clock()

let LODOctreeSearchRadius = 50

window.capturerGo = -1
const stats = createStats()

// update all LODs before first render
// camera.updateMatrix()
// camera.updateMatrixWorld()
// renderer.render(scene, camera)
// for (let lod of lods) {
//   lod.update(camera)
// }
// renderer.render(scene, camera)


const render = () => {
  stats.begin()

  const delta = clock.getDelta()
  if (atpReady) {
    ATPSynthase.rotation.z = ATPSynthase.rotation.z + delta*0.8
    // bboxH.update()
  }
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


  controls.update(delta*0.1)
  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  // update octree **after** render loop
  // assumed to be faster than going through all LODs
  // hmm. low fps when trying this with atp synthases. back to for loop
  // LODOctree.update()
  // const nearbyLODS = LODOctree
  //   .search(camera.position, LODOctreeSearchRadius)
  //   .map(octreeObject => octreeObject.object.id)
  // const nearbyLODSLength = nearbyLODS.length
  // for (let i=0; i < nearbyLODSLength; i++) {
  //   lods[i].update(camera)
  // }

  // console.time('lodUpdate')
  for (let i=0; i < lods.length; i++) {
    lods[i].update(camera)
  }
  // console.timeEnd('lodUpdate')

  stats.end()

  requestAnimationFrame(render)
}

// letttsss goooooo
render()
