'use strict'

const nucleus = new THREE.Mesh(
  new THREE.SphereGeometry(2500, 100, 100),
  new THREE.MeshLambertMaterial({color: 0x84c2c2, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
)

export default nucleus
