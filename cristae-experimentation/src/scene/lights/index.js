export default () => {
  const pLight = new THREE.Object3D()

  const pLight1 = new THREE.PointLight(0xffffff, 1, 1000)
  const pLight2 = pLight1.clone()
  const pLight3 = pLight1.clone()
  const pLight4 = pLight1.clone()

  pLight1.position.set(0, 10, 0)
  pLight2.position.set(0, -10, 0)
  pLight3.position.set(10, 0, 0)
  pLight4.position.set(-10, 0, 0)

  pLight.add(pLight1)
  pLight.add(pLight2)
  pLight.add(pLight3)
  pLight.add(pLight4)

  return({ pLight })
}
