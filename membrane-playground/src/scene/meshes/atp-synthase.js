import { getBBoxDimensions, getGroupBoundingBox } from '../../lib/geometry-utils.js'
import { randMaterial } from '../../lib/material-utils.js'

const materialMappingsLambert = {
  'Axel-Front': new THREE.MeshLambertMaterial({color: 0x007C00}),
  'OSAP': new THREE.MeshLambertMaterial({color: 0x950095}),
  'Stator-Blue-Med': new THREE.MeshLambertMaterial({color: 0x1753c7}),
  'F1-Redish-Front': new THREE.MeshLambertMaterial({color: 0xFFBC00}),
  'Stator-Blue-Dark': new THREE.MeshLambertMaterial({color: 0x431cc6}),
  'Stator-Base': new THREE.MeshLambertMaterial({color: 0xBC00BC}),
  'Test-Velvet-Green': new THREE.MeshLambertMaterial({color: 0x21f112}),
  'Test-Velvet-Green.001': new THREE.MeshLambertMaterial({color: 0x60be44}),
  'TM-Section': new THREE.MeshLambertMaterial({color: 0xBA9F7C}),
  'F1-Redish-Dark-Front': new THREE.MeshLambertMaterial({color: 0xFF5900})
}

const materialMappings = {
  'Axel-Front': 0x007C00,
  'OSAP': 0x950095,
  'Stator-Blue-Med': 0x1753c7,
  'F1-Redish-Front': 0xFFBC00,
  'Stator-Blue-Dark': 0x431cc6,
  'Stator-Base': 0xBC00BC,
  'Test-Velvet-Green': 0x21f112,
  'Test-Velvet-Green.001': 0x60be44,
  'TM-Section': 0xBA9F7C,
  'F1-Redish-Dark-Front': 0xFF5900
}

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

export const dimerCreatorColoured = ({synthase, spread=-0.5, rotationY=0, rotationX=Math.PI/4}) => {
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

  const dimer = new THREE.Mesh(bufferGeom, new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: THREE.VertexColors}))

  return dimer
}

// +0.4
// -0.2
export const dimerCreatorColouredSpinning = ({synthase, spread=0.4, rotationY=0, rotationX=Math.PI/4}) => {
  const synthaseA = synthase.clone()
  const synthaseB = synthase.clone()

  const boundingBox = getGroupBoundingBox(synthaseA)

  const difference = new THREE.Vector3().subVectors(boundingBox.max, boundingBox.min)

  synthaseA.rotation.x = rotationX
  synthaseB.rotation.x = -rotationX
  synthaseB.rotation.y = Math.PI
  synthaseB.position.set(0, 0, -(difference.z + spread*difference.z))

  const dimer = new THREE.Group()
  dimer.add(synthaseA)
  dimer.add(synthaseB)

  return dimer
}

export const constructDimer = (synthase) => {
  const ATPSynthase = constructSynthase(synthase)

  let ATPSynthaseDimer = new dimerCreator(0.1, ATPSynthase)

  ATPSynthaseDimer.scale.set(0.005, 0.005, 0.005)

  return ATPSynthaseDimer
}

export const constructSynthase = (object) => {
  const ATPSynthase = new THREE.Group()
  const components = []

  for (let i=1; i < object.children.length; i++) {
    const child = object.children[i]
    child.name = child.name.split('_')[2]

    child.material = materialMappingsLambert[child.name]

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
    const name = mesh.name.replace(/_ShapeIndexedFaceSet\.[\d]+_/, '_')
    const section = name.split('_')[1]

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

export const constructSynthaseColoured = (group) => {
  const bilayerWidth = 4

  let scale = 1
  let geometry
  const components = []
  // console.log(group.children.length)
  // console.log(Object.keys(materialMappingsLambert).length)
  for (let i=1; i < group.children.length; i++) {
    const mesh = group.children[i]
    const geom = new THREE.Geometry().fromBufferGeometry(mesh.geometry)
    // console.log(geom)

    // TODO define naming conventions to make this work the same for all proteins
    const name = mesh.name.replace(/_ShapeIndexedFaceSet\.[\d]+_/, '_')
    const section = name.split('_')[1]
    // console.log(section)

    geom.faces.forEach( (face) => {
      // face.materialIndex = Object.keys(materialMappingsLambert).indexOf(section)
      face.color.setHex(materialMappings[section])
    })

    if (section === 'TM-Section') {
      const bbox = getBBoxDimensions(mesh.geometry)
      scale = bilayerWidth / bbox.height
      console.log('scale is ', scale)
    }

    if (i === 1) {
      geometry = geom
    } else if (i > 1) {
      components.push(geom)
    }
  }

  for (let i=0; i < components.length; i++) {
    geometry.merge(components[i])
  }


  const materials = Object.keys(materialMappingsLambert).map(key => materialMappingsLambert[key])
  const material = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: THREE.VertexColors})

  geometry = (new THREE.BufferGeometry()).fromGeometry(geometry)
  // const porin = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
  const porin = new THREE.Mesh(geometry, material)
  // console.log(porin)

  porin.scale.set(scale, scale, scale)

  return porin
}

export const constructSynthaseSpinning = (group) => {
  const bilayerWidth = 4

  let scale = 1
  let geometry
  const components = []
  let barrelGeom = null

  const ATPSynthase = new THREE.Group()

  const buildBarrel = (geom) => {
    // geom = new THREE.Geometry().fromBufferGeometry(geom)

    if (barrelGeom === null) {
      barrelGeom = geom
    } else {
      barrelGeom.merge(geom)
    }
  }

  // console.log(group.children.length)
  // console.log(Object.keys(materialMappingsLambert).length)
  for (let i=1; i < group.children.length; i++) {
    const mesh = group.children[i]
    const geom = new THREE.Geometry().fromBufferGeometry(mesh.geometry)
    // console.log(geom)

    // TODO define naming conventions to make this work the same for all proteins
    const name = mesh.name.replace(/_ShapeIndexedFaceSet\.[\d]+_/, '_')
    const section = name.split('_')[1]
    // console.log(section)

    geom.faces.forEach( (face) => {
      // face.materialIndex = Object.keys(materialMappingsLambert).indexOf(section)
      face.color.setHex(materialMappings[section])
    })

    switch (section) {
      case 'TM-Section':
        const bbox = getBBoxDimensions(mesh.geometry)
        scale = bilayerWidth / bbox.height
        // console.log('scale is ', scale)

        buildBarrel(geom)

        break
      case 'Test-Velvet-Green':
        buildBarrel(geom)
        break
      case 'Test-Velvet-Green.001':
        buildBarrel(geom)
        break
      default:
        if (i === 1) {
          geometry = geom
        } else if (i > 1) {
          components.push(geom)
        }
    }
  }

  for (let i=0; i < components.length; i++) {
    geometry.merge(components[i])
  }


  const materials = Object.keys(materialMappingsLambert).map(key => materialMappingsLambert[key])
  const material = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: THREE.VertexColors})

  geometry = (new THREE.BufferGeometry()).fromGeometry(geometry)
  // const porin = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))
  const porin = new THREE.Mesh(geometry, material)
  // console.log(porin)

  porin.scale.set(scale, scale, scale)

  const barrel = new THREE.Mesh(barrelGeom, material)
  barrel.scale.set(scale, scale, scale)

  ATPSynthase.add(porin)
  ATPSynthase.add(barrel)

  return ATPSynthase
}
