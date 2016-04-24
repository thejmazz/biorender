'use strict'

import { Y_AXIS } from './constants.js'
import { randMaterial } from './material-utils.js'

export const getBBoxDimensions = (geometry) => {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox()
  }

  const { max, min } = geometry.boundingBox
  const bbox = {
    width: max.x - min.x,
    height: max.y - min.y,
    depth: max.z - min.z
  }

  return bbox
}

export const getBoundingRadius = (geometry) => {
  if (!geometry.boundingSphere) {
    geometry.computeBoundingSphere()
  }

  const radius = geometry.boundingSphere.radius

  return radius
}

const applyScaleToBBox = (bbox, scale) => {
  const { x, y, z } = scale

  bbox.width *= x
  bbox.height *= y
  bbox.depth *= z

  return bbox
}

export const populateMembrane = (mesh, block, type) => {
  const { thickness } = mesh.userData

  if (mesh instanceof THREE.Group) {
    mesh.children.forEach( (child) => {
      if (child.name.indexOf('inner') !== -1 && type === 'inner') {
        console.log('using inner')
        mesh = child
      } else if (child.name.indexOf('outer') !== -1 && type === 'outer') {
        console.log('using outer')
        mesh = child
      }
    })
  }

  let offset
  if (type === 'inner') {
    offset = thickness/2
  } else if (type === 'outer') {
    offset = -(thickness/2)
  }

  const octree = new THREE.Octree()
  const verts = mesh.geometry.vertices
  const faces = mesh.geometry.faces
  const bbox = applyScaleToBBox(getBBoxDimensions(block.geometry), block.scale)
  const boundingRadius = getBoundingRadius(block.geometry)
  // uses half dimensions
  const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(bbox.width/2, bbox.height/2, bbox.depth/2))

  // Array of previously used bounding boxes
  let addedBlocks = []
  // Group to build
  const proteins = new THREE.Group()

  const addNewBox = (goblinBox) => {
    const vert = goblinBox.position
    const { x, y, z, w } = goblinBox.rotation
    const { half_width, half_height, half_depth } = goblinBox.shape

    const newBlock = new Goblin.RigidBody(new Goblin.BoxShape(half_width, half_height, half_depth))
    newBlock.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
    newBlock.rotation.set(x, y, z, w)
    newBlock.updateDerived()

    addedBlocks.push(newBlock)

    octree.add({x: vert.x, y: vert.y, z: vert.z, radius: 4, id: addedBlocks.length - 1})
    octree.update()

    const newProtein = block.clone()
    newProtein.material = randMaterial()
    newProtein.position.set(vert.x, vert.y, vert.z)
    newProtein.rotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w))

    proteins.add(newProtein)
  }

  // for (let i=0; i < faces.length; i++) {
  //   const { a, b, c, vertexNormals } = faces[i]
  //
  //   const faceVerts = [verts[a], verts[b], verts[c]].map( (vert, i) => {
  //     // const v = (new THREE.Vector3(vert.x, verts.y, verts.z)).applyEuler(mesh.rotation)
  //     // v.x = v.x + mesh.position.x
  //     // v.y = v.y + mesh.position.y
  //     // v.z = v.z + mesh.position.z
  //
  //     const obj = {
  //       vert,
  //       normal: vertexNormals[i]
  //     }
  //
  //     return obj
  //   })
  //
  //   if (i === 0) {
  //     console.log(faceVerts)
  //   }
  // }


  for (let i=0; i < verts.length; i+= 1) {
  // for (let i=0; i < 30; i++ ) {
    // Rotate and realign vertex
    const vert = (new THREE.Vector3(verts[i].x, verts[i].y, verts[i].z)).applyEuler(mesh.rotation)
    vert.x = vert.x + mesh.position.x
    vert.y = vert.y + mesh.position.y
    vert.z = vert.z + mesh.position.z

    const direction = (new THREE.Vector3())
      .copy(vert)
      .sub(mesh.position)
      .normalize()

    vert.x = vert.x + offset*direction.x
    vert.y = vert.y + offset*direction.y
    vert.z = vert.z + offset*direction.z

    // Get angle from mesh position to this vertex
    const quat = (new THREE.Quaternion()).setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      (new THREE.Vector3()).copy(vert).normalize()
    )

    quat.multiply((new THREE.Quaternion()).setFromAxisAngle(Y_AXIS, Math.random()*Math.PI))

    // Update goblinBox position to current vertex
    goblinBox.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
    goblinBox.rotation.set(quat.x, quat.y, quat.z, quat.w)
    goblinBox.updateDerived()

    // Look for collisions in nearby area using octree search
    const searchResults = octree.search(new THREE.Vector3(vert.x, vert.y, vert.z), boundingRadius*2)
    let noCollisions = true
    for (let j=0; j < searchResults.length; j++) {
      const collidee = addedBlocks[searchResults[j].object.id]
      const contact = Goblin.GjkEpa.testCollision(goblinBox, collidee)

      if (contact !== undefined) {
        // console.log('collision with vertex %d', i)
        noCollisions = false
        break
      }
    }

    if (noCollisions || addedBlocks.length === 0) {
      // console.log('no collision with vertex %d', i)
      addNewBox(goblinBox)
    }
  }

  return proteins
}
