'use strict'

import nucleus from './nucleus'
import cube from '../proteins/cube.js'

const cell = new THREE.Mesh(
  new THREE.SphereGeometry(10000, 100, 100, 0, Math.PI*2, Math.PI/2, Math.PI),
  new THREE.MeshNormalMaterial({wireframe: true})
)

cell.add(nucleus)
cell.add(cube)

export default cell
