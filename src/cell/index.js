'use strict'

import nucleus from './nucleus'
import cube from '../proteins/cube.js'

const cell = new THREE.Mesh(
  new THREE.SphereGeometry(10000, 100, 100, 0, Math.PI*2, Math.PI/2, Math.PI),
  new THREE.MeshNormalMaterial({wireframe: true})
)

const loader = new THREE.JSONLoader()
loader.load('/models/mitochondria.json', (geom) => {
  console.log(geom)
  const mitochondria = new THREE.Mesh(
    geom,
    new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
  )



  mitochondria.position.set(2800,0,0)
  mitochondria.rotation.y = Math.PI / 2
  mitochondria.scale.set(37.5, 37.5, 37.5)
  cell.add(mitochondria)

  const m2 = mitochondria.clone()
  m2.position.set(0,0,0)
  cell.add(m2)

  var bbox = new THREE.BoundingBoxHelper( mitochondria, 0x000000 );
  bbox.update();
  // cell.add( bbox );
  console.log(bbox)
})

cell.add(nucleus)
cell.add(cube)

export default cell
