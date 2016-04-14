import { textureLoader } from '../../lib/loaders.js'

export const constructCristae = (group) => {
  let curved, etc, rim

  group.children.forEach( (child) => {
    child.name = child.name.split('_')[0]
    // console.log(child.name)

    if (child.name === 'Cristae.Curved') {
      child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      curved = child
    } else if (child.name === 'Cristae.ETC') {
      child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})
      etc = child
    } else if (child.name === 'Cristae.Rim') {
      const phosphosAlbedo = textureLoader.load('/textures/phospholipids_a.png')
      const phosphosBump = textureLoader.load('/textures/phospholipids_b.png')

      child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry)

      for (let i = 0; i < child.geometry.faces.length;  i+= 2) {
       child.geometry.faceVertexUvs[0].push([
         new THREE.Vector2(0 , 0),
         new THREE.Vector2(0 , 1),
         new THREE.Vector2(1 , 0),
       ])
       child.geometry.faceVertexUvs[0].push([
         new THREE.Vector2(0 , 1),
         new THREE.Vector2(1 , 1),
         new THREE.Vector2(1 , 0),
       ])
      }

      child.geometry.uvsNeedUpdate = true

      child.material = new THREE.MeshPhongMaterial({map: phosphosAlbedo, bumpMap: phosphosBump})
      rim = child
    }
  })

  // console.log(curved)

  curved.geometry = new THREE.Geometry().fromBufferGeometry(curved.geometry)

  return { curved, etc, rim }
}
