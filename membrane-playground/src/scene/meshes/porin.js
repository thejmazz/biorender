'use strict'

import { getBBoxDimensions } from '../../lib/geometry-utils.js'

export const constructPorin = (group) => {
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
