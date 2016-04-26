import { getBBoxDimensions } from '../../lib/geometry-utils.js'
import { randMaterial } from '../../lib/material-utils.js'

export const crudeSynthaseCreator = () => {
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

export const crudeDimerCreator = (angle=Math.PI/8, spread=0.04, synthase) => {
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

export const dimerCreator = ({synthase, spread=-0.2, rotationY=0, rotationX=Math.PI/4}) => {
  const synthaseA = synthase.clone()
  // for some reason, need this..
  synthaseA.rotation.x = rotationX

  const synthaseB = synthase.clone()

  const bBox = new THREE.BoundingBoxHelper(synthaseA, 0x000000)
  bBox.update()

  synthaseA.geometry = new THREE.Geometry().fromBufferGeometry(synthaseA.geometry)
  synthaseA.geometry.rotateX(rotationX)

  synthaseB.geometry = new THREE.Geometry().fromBufferGeometry(synthaseB.geometry)
  synthaseB.geometry.rotateX(rotationX)
  synthaseB.geometry.rotateY(Math.PI)
  synthaseB.geometry.translate(0,0, -(bBox.scale.z + spread*bBox.scale.z))

  const geom = synthaseA.geometry
  geom.merge(synthaseB.geometry)
  geom.center()

  const bufferGeom = new THREE.BufferGeometry().fromGeometry(geom)

  const dimer = new THREE.Mesh(bufferGeom, randMaterial())

  return dimer
}

export const constructDimer = (synthase) => {
  const ATPSynthase = constructSynthase(synthase)

  let ATPSynthaseDimer = new dimerCreator(0.1, ATPSynthase)

  ATPSynthaseDimer.scale.set(0.005, 0.005, 0.005)

  return ATPSynthaseDimer
}

export const constructSynthase = (object) => {
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

  const ATPSynthase = new THREE.Group()
  const components = []

  for (let i=1; i < object.children.length; i++) {
    const child = object.children[i]
    child.name = child.name.split('_')[2]

    child.material = materialMappings[child.name]

    components.push(child)
  }

  components.forEach(component => ATPSynthase.add(component))

  return ATPSynthase
}

export const constructSynthaseSimple = (group) => {
  const bilayerWidth = 4

  let scale = 1
  let geometry
  const components = []
  for (let i=1; i < group.children.length; i++) {
    const mesh = group.children[i]

    // TODO define naming conventions to make this work the same for all proteins
    mesh.name = mesh.name.replace(/_ShapeIndexedFaceSet_/, '_')
    const section = mesh.name.split('_')[1]

    if (section === 'TM-Section') {
      const bbox = getBBoxDimensions(mesh.geometry)
      scale = bilayerWidth / bbox.height
    }

    if (i === 1) {
      geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry)
    } else if (i > 1) {
      components.push(new THREE.Geometry().fromBufferGeometry(mesh.geometry))
    }
  }

  for (let i=0; i < components.length; i++) {
    geometry.merge(components[i])
  }

  geometry = (new THREE.BufferGeometry()).fromGeometry(geometry)

  const porin = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({color: 0xb04921, side: THREE.DoubleSide})
  )
  porin.scale.set(scale, scale, scale)

  return porin
}
