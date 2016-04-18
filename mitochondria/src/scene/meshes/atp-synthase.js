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

export const dimerCreator = (spread=0, synthase) => {
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
