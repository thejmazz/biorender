export const makeLOD = ({meshes, distances}) => {
  const lod = new THREE.LOD()

  meshes.forEach( (mesh, i) => {
    lod.addLevel(mesh, distances[i])
  })

  // TODO what do these really do..
  // lod.updateMatrix()
  // lod.matrixAutoUpdate = false

  return lod
}
