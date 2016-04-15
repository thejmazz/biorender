import { textureLoader } from '../../lib/loaders.js'
import { assignUVs } from '../../lib/UV-util.js'

export const constructCristae = (group) => {
  const phosphosTopAlbedo = textureLoader.load('/textures/phospholipids-top/phospholipids-top_a.png')
  phosphosTopAlbedo.wrapT = phosphosTopAlbedo.wrapS = THREE.RepeatWrapping
  phosphosTopAlbedo.repeat.set(100,100)
  const phosphosTopBump = textureLoader.load('/textures/phospholipids-top/phospholipids-top_b.png')
  phosphosTopBump.wrapS = phosphosTopBump.wrapT = THREE.RepeatWrapping
  phosphosTopBump.repeat.set(100,100)

  let curved, etc, rim

  group.children.forEach( (child) => {
    child.name = child.name.split('_')[0]
    // console.log(child.name)

    if (child.name === 'Cristae.Curved') {
      child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry)
      assignUVs(child.geometry)


      // child.material = new THREE.MeshLambertMaterial({color: 0xe42908, side: THREE.DoubleSide})
      phosphosTopAlbedo.repeat.set(0.5, 0.5)
      child.material = new THREE.MeshPhongMaterial({map: phosphosTopAlbedo, bumpMap: phosphosTopBump, side: THREE.DoubleSide})
      curved = child
    } else if (child.name === 'Cristae.ETC') {
      child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry)
      assignUVs(child.geometry)

      child.material = new THREE.MeshPhongMaterial({map: phosphosTopAlbedo, bumpMap: phosphosTopBump, side: THREE.DoubleSide})
      // child.material = new THREE.MeshLambertMaterial({color: 0x2141b5, side: THREE.DoubleSide})

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

  // curved.geometry = new THREE.Geometry().fromBufferGeometry(curved.geometry)

  curved.scale.set(1, 1, 0.5)
  etc.scale.set(1, 1, 0.5)
  rim.scale.set(1, 1, 0.5)

  return { curved, etc, rim }
}
