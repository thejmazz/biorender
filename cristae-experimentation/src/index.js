'use strict'

import { createScene, createStats } from './lib/create.js'

const { scene, camera, renderer } = createScene({
  clearColor: 0xffffff,
  antialias: true
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

const OBJLoader = new THREE.OBJLoader()
const textureLoader = new THREE.TextureLoader()

const controls = new THREE.OrbitControls(camera, renderer.domElement)

const cLight = new THREE.PointLight(0xffffff, 1, 1000)
camera.add(cLight)
cLight.position.set(0,0,-0.1)
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

const crudeSynthaseCreator = () => {
  const synthase = new THREE.Group()
  const barrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.01,0.01,0.01),
    new THREE.MeshLambertMaterial({color: 0x12d0f6})
  )
  barrel.scale.set(2,3,2)
  synthase.add(barrel)

  const rotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.04, 16),
    new THREE.MeshLambertMaterial({color: 0x2fc37f})
  )
  rotor.position.set(0,0.035,0)
  synthase.add(rotor)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshLambertMaterial({color: 0xc4caf4})
  )
  head.position.set(0,0.045,0)
  synthase.add(head)

  return synthase
}

const dimerCreator = (angle=Math.PI/8, spread=0.04, synthase) => {
  const dimer = new THREE.Group()
  const synthaseA = synthase
  const synthaseB = synthase.clone()

  dimer.add(synthaseA)
  dimer.add(synthaseB)

  synthaseA.rotation.z = angle
  synthaseB.rotation.z = -angle
  synthaseB.position.set(spread, 0, 0)

  return dimer
}

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
      const phosphosAlbedo = textureLoader.load('/textures/phospholipids_a.png')
      const phosphosBump = textureLoader.load('/textures/phospholipids_b.png')

      child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry)

      for (let i = 0; i < child.geometry.faces.length;  i+= 2) {
       child.geometry.faceVertexUvs[0].push([
         new THREE.Vector2(0 , 0),
         new THREE.Vector2(0 , 1),
         new THREE.Vector2(1 , 0),
       ])
       child.geometry.faceVertexUvs[0].push([
         new THREE.Vector2(0 , 1),
         new THREE.Vector2(1 , 1),
         new THREE.Vector2(1 , 0),
       ])
      }

      child.geometry.uvsNeedUpdate = true

      child.material = new THREE.MeshPhongMaterial({map: phosphosAlbedo, bumpMap: phosphosBump})
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
  // scene.add(curvedHelper)
  // console.log(curvedHelper)

  // Pull out position and scale of curved section
  const curvedPosition = curvedHelper.position
  const curvedScale = curvedHelper.scale
  // console.log(curvedPosition)
  // console.log(curvedScale)

  // helper sphere
  const sphereGeom = new THREE.SphereGeometry(0.01, 16, 16)
  const sphere = new THREE.Mesh(sphereGeom, new THREE.MeshLambertMaterial({color: 0x158e41}))
  sphere.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  // scene.add(sphere)

  const dimer = dimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator())
  // TODO rotate from center of group
  dimer.rotation.x = Math.PI/2
  dimer.rotation.z = Math.PI/2
  // dimer.position.set(curvedPosition.x - curvedScale.x/2, curvedPosition.y + curvedScale.y/2, curvedPosition.z)
  dimer.position.set(-0.983, 0.83, -0.02)
  // scene.add(dimer)

  // Get dimer dimensions
  const dimerHelper = new THREE.BoundingBoxHelper(dimer, 0xf6f400)
  dimerHelper.update()
  // scene.add(dimerHelper)
  const dimerScale = dimerHelper.scale
  // console.log(dimerScale)
  // By inspection, z is the size we want..

  let currentSpot = -curvedScale.y/2 + dimerScale.y + 0.005
  while (currentSpot <= curvedScale.y/2 + dimerScale.y/2) {
    const anotherDimer = dimer.clone()
    anotherDimer.position.set(-0.983, currentSpot, -0.02)
    scene.add(anotherDimer)

    currentSpot += dimerScale.y
  }
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

let lodReady = false
let lod
OBJLoader.load('/models/ATP-synthase_d0.05.obj', (object) => {
  const ATPSynthase = new THREE.Group()
  const components = []

  const materialMappings = {
    'Axel-Front': new THREE.MeshLambertMaterial({color: 0x007C00}),
    'OSAP': new THREE.MeshLambertMaterial({color: 0x6f8efa}),
    'Stator-Blue-Med': new THREE.MeshLambertMaterial({color: 0x1753c7}),
    'F1-Redish-Front': new THREE.MeshLambertMaterial({color: 0xc43535}),
    'Stator-Blue-Dark': new THREE.MeshLambertMaterial({color: 0x431cc6}),
    'Stator-Base': new THREE.MeshLambertMaterial({color: 0x2f28be}),
    'Test-Velvet-Green': new THREE.MeshLambertMaterial({color: 0x21f112}),
    'Test-Velvet-Green.001': new THREE.MeshLambertMaterial({color: 0x60be44}),
    'Axel-Hydrophobic': new THREE.MeshLambertMaterial({color: 0xcdcdcd}),
    'F1-Redish-Dark-Front': new THREE.MeshLambertMaterial({color: 0xd5381d})
  }

  for (let i=1; i < object.children.length; i++) {
    const child = object.children[i]
    child.name = child.name.split('_')[2]

    child.material = materialMappings[child.name]

    components.push(child)
  }

  components.forEach(component => ATPSynthase.add(component))

  const newDimerCreator = (spread=0, synthase) => {
    const dimer = new THREE.Group()

    const synthaseA = synthase
    const synthaseB = synthase.clone()

    const bBox = new THREE.BoundingBoxHelper(synthaseA, 0x000000)
    bBox.update()


    synthaseB.rotation.y = Math.PI
    synthaseB.position.set(0,0, bBox.scale.z + spread*bBox.scale.z)

    dimer.add(synthaseA)
    dimer.add(synthaseB)

    return dimer
  }


  const ATPSynthaseDimer = new newDimerCreator(0.1, ATPSynthase)
  // ATPSynthaseDimer.position.set(-0.983, 0.83, -0.02)
  // ATPSynthaseDimer.position.set(0,0,1)

  ATPSynthaseDimer.scale.set(0.005, 0.005, 0.005)

  // scene.add(ATPSynthaseDimer)

  const crudeDimer = dimerCreator(Math.PI/4, 0.04, crudeSynthaseCreator())
  crudeDimer.rotation.y = Math.PI/2
  // crudeDimer.position.set(0.2,0,1)
  // scene.add(crudeDimer)

  lod = new THREE.LOD()
  lod.addLevel(ATPSynthaseDimer, 0.1)
  lod.addLevel(crudeDimer, 0.5)
  lod.position.set(0,0,1)
  lod.updateMatrix()
  lod.matrixAutoUpdate = false

  lod.update(camera)

  scene.add(lod)
  lodReady = true
})

// ===========================================================================

// window.capturer = new CCapture( { format: 'png' } )

const stats = createStats()
const render = () => {
  stats.begin()

  for (let keyframe of keyframes) {
    keyframe()
  }

  if (lodReady) {
    lod.update(camera)
  }

  renderer.render(scene, camera)
  // capturer.capture(renderer.domElement)

  stats.end()

  requestAnimationFrame(render)
}

render()
