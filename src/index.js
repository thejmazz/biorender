'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0xffffff,
  antialias: true
})
window.scene = scene

camera.position.set(0,0,5)

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

const OBJLoader = new THREE.OBJLoader()

const controls = new THREE.OrbitControls(camera, renderer.domElement)

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0,0,-0.1)
scene.add(camera)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshLambertMaterial({color: 0xfbeec4, side: THREE.DoubleSide})
)
ground.position.set(0,-2,0)
ground.rotation.x = Math.PI/2
scene.add(ground)

OBJLoader.load('/models/cristae.obj', (object) => {
  let curved = []
  let rim = []
  let etc = []

  // console.log(object)

  object.children.forEach( (child) => {
    child.name = child.name.split('_')[0]

    // console.log(child.name)
    if (child.name === 'Cristae.Curved') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      curved.push(child)
    } else if (child.name === 'Cristae.ETC') {
      child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})
      etc.push(child)
    } else if (child.name === 'Cristae.Rim') {
      child.material = new THREE.MeshLambertMaterial({color: 0x6d12e0, side: THREE.DoubleSide})
      rim.push(child)
    }

    // if (child.name === 'Cristae') {
    //   scene.add(child)
    // }
  })


  // curved.forEach(curve => scene.add(curve))
  // rim.forEach(r => scene.add(r))
  // etc.forEach(e => scene.add(e))
})

OBJLoader.load('/models/cristae2.obj', (object) => {
  let curved = []
  let rim = []
  let etc = []

  let master

  console.log(object)

  object.children.forEach( (child) => {
    child.name = child.name.split('_')[0]

    console.log(child.name)
    if (child.name === 'Cristae.Curved') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      curved.push(child)
    } else if (child.name === 'Cristae.ETC') {
      child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})
      etc.push(child)
    } else if (child.name === 'Cristae.Rim') {
      child.material = new THREE.MeshLambertMaterial({color: 0x6d12e0, side: THREE.DoubleSide})
      rim.push(child)
    } else if (child.name === 'Cristae') {
      master = child
    }
  })


  // curved.forEach(curve => scene.add(curve))
  // rim.forEach(r => scene.add(r))
  // etc.forEach(e => scene.add(e))

  // scene.add(master)
})

OBJLoader.load('/models/cristae_nogroups.obj', (object) => {
  // console.log(object)
  let mesh

  object.children.forEach( (child) => {
    mesh = child
  })

  mesh.material = new THREE.MeshLambertMaterial({color: 0xbdb5c4, side: THREE.DoubleSide})
  mesh.position.set(0,0,-2)
  // scene.add(mesh)
})

OBJLoader.load('/models/cristae_mats.obj', (object) => {
  console.log(object)
  let red, blue, purple

  object.children.forEach( (child) => {
    console.log(child.name)
    if (child.name === 'Cristae_Cube.001_Red') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe92f06, side: THREE.DoubleSide})
      red = child
    } else if (child.name === 'Cristae_Cube.001_Blue') {
      child.material = new THREE.MeshLambertMaterial({color: 0x181ad7, side: THREE.DoubleSide})
      blue = child
    } else if (child.name === 'Cristae_Cube.001_Purple') {
      child.material = new THREE.MeshLambertMaterial({color: 0xb815da, side: THREE.DoubleSide})
      purple = child
    }
  })

  scene.add(red)
  scene.add(blue)
  scene.add(purple)
})

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
