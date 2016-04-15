export const constructETC = (group) => {
  const materialMappings = {
    'Complex-1': new THREE.MeshLambertMaterial({color: 0x0000FF}),
    'Complex-II': new THREE.MeshLambertMaterial({color: 0x5959FF}),
    'Complex-II-2': new THREE.MeshLambertMaterial({color: 0x5959FF}),
    'Complex-III': new THREE.MeshLambertMaterial({color: 0x4545FF}),
    'Complex-III-2': new THREE.MeshLambertMaterial({color: 0x4545FF}),
    'Complex-IV': new THREE.MeshLambertMaterial({color: 0x3030FF}),
    'Complex-IV-2': new THREE.MeshLambertMaterial({color: 0x3030FF}),
  }

  const ETC = new THREE.Group()
  const components = []


  for (let i=1; i < group.children.length; i++) {
    const child = group.children[i]

    child.name = child.name.split('ETC.')[1]

    child.material = materialMappings[child.name]

    components.push(child)
  }

  components.forEach(component => ETC.add(component))

  return ETC
}
