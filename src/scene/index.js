import lightsCreator from './lights'

export default () => {
  const { pLight } = lightsCreator()

  const boxGeom = new THREE.BoxGeometry(1, 1, 1)
  const normalMat = new THREE.MeshLambertMaterial({color: 0x9cfba0})

  const box = new THREE.Mesh(boxGeom, normalMat)

  // box.keyframe = () => {
  //   box.rotation.x += 0.01
  //   box.rotation.y += 0.01
  // }

  return({ box })
}
