'use strict'

const nucleus = new THREE.Mesh(
  new THREE.SphereGeometry(2500, 100, 100),
  new THREE.MeshBasicMaterial({color: 0x84c2c2, wireframe: true})
)

export default nucleus
