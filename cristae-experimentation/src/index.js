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


OBJLoader.load('/models/cristae_polygroups.obj', (object) => {
  // console.log(object)
  let curved, etc, rim

  object.children.forEach( (child) => {
    child.name = child.name.split('_')[0]
    // console.log(child.name)

    if (child.name === 'Cristae.Curved') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      curved = child
    } else if (child.name === 'Cristae.ETC') {
      child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})
      etc = child
    } else if (child.name === 'Cristae.Rim') {
      child.material = new THREE.MeshLambertMaterial({color: 0x6d12e0, side: THREE.DoubleSide})
      rim = child
    }
  })

  // console.log(curved)

  curved.geometry = new THREE.Geometry().fromBufferGeometry(curved.geometry)

  scene.add(curved)
  scene.add(etc)
  scene.add(rim)

  // Bounding box around curved section
  const curvedHelper = new THREE.BoundingBoxHelper(curved, 0xf6f400)
  curvedHelper.update()
  scene.add(curvedHelper)
  // console.log(curvedHelper)

  // Pull out position and scale of curved section
  const curvedPosition = curvedHelper.position
  const curvedScale = curvedHelper.scale
  console.log(curvedPosition)
  console.log(curvedScale)

  const sphereGeom = new THREE.SphereGeometry(0.01, 16, 16)
  const sphere = new THREE.Mesh(sphereGeom, new THREE.MeshLambertMaterial({color: 0x158e41}))
  sphere.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  scene.add(sphere)
})

// has /^[gs]/ lines deleted
OBJLoader.load('/models/cristae_polygroups_whole.obj', (object) => {
  // console.log(object)
  let mesh

  object.children.forEach( (child) => {
    mesh = child
  })

  mesh.material = new THREE.MeshLambertMaterial({color: 0xbdb5c4, side: THREE.DoubleSide})
  mesh.position.set(0,0,-2)
  scene.add(mesh)
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
