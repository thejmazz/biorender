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

export const getGroupBoundingBox = (group) => {
  const boundingBox = { min: new THREE.Vector3(Number.MAX_VALUE), max: new THREE.Vector3(Number.MIN_VALUE) }

  for (let i=0; i < group.children.length; i++) {
    const child = group.children[i]
    child.geometry.computeBoundingBox()
    const childBox = child.geometry.boundingBox

    boundingBox.min.x = Math.min(childBox.min.x, boundingBox.min.x)
    boundingBox.min.y = Math.min(childBox.min.y, boundingBox.min.y)
    boundingBox.min.z = Math.min(childBox.min.z, boundingBox.min.z)

    boundingBox.max.x = Math.max(childBox.max.x, boundingBox.max.x)
    boundingBox.max.y = Math.max(childBox.max.y, boundingBox.max.y)
    boundingBox.max.z = Math.max(childBox.max.z, boundingBox.max.z)
  }

  return boundingBox
}

export const centerGroup = (group) => {
  const offset = new THREE.Vector3()
  const boundingBox = new THREE.Box3().setFromObject(group)

  // get center of bbox
  offset.addVectors( boundingBox.min, boundingBox.max );
  offset.multiplyScalar( -0.5 );

  // move all meshes
  for( var i = 0; i < group.children.length; ++i)
  {
      // apply matrix translation
      group.children[i].geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
      // update bbox of each mesh
      group.children[i].geometry.computeBoundingBox();
  }
}

const applyScaleToBBox = (bbox, scale) => {
  const { x, y, z } = scale

  bbox.width *= x
  bbox.height *= y
  bbox.depth *= z

  return bbox
}

export const populateMembrane = (mesh, block, type, checkVerts= (vert) => true, randomSpin=true, rot=null, collisionScale=1) => {
  console.log(`populating ${mesh.name}`)
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
  // console.log(`offset is ${offset}`)

  const octree = new THREE.Octree()
  let verts = mesh.geometry.vertices
  // console.log(`we have ${verts.length} verts`)
  // if (goodVerts.length > 0) {
  //   console.log('using goodVerts')
  //   verts = goodVerts
  // }
  const faces = mesh.geometry.faces
  const bbox = applyScaleToBBox(getBBoxDimensions(block.geometry), block.scale)
  // console.log(bbox)
  const boundingRadius = getBoundingRadius(block.geometry)
  // uses half dimensions
  // const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(bbox.width/2, bbox.height/2, bbox.depth/2))
  const goblinBox = new Goblin.RigidBody(new Goblin.BoxShape(collisionScale*(bbox.width/2), collisionScale*(bbox.height/2), collisionScale*(bbox.depth/2)))

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
    // console.log(`adding a protein for ${mesh.name} at (${vert.x}, ${vert.y}, ${vert.z})`)

    // TODO integrate into a debug mode
    // const wBox = new THREE.Mesh(
    //   new THREE.BoxGeometry(half_width*2, half_height*2, half_depth*2),
    //   new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
    // )
    // wBox.position.set(vert.x, vert.y, vert.z)
    // // wBox.geometry.translate(-newProtein.geometry.boundingBox.min.x, -newProtein.geometry.boundingBox.min.y, 0)
    // wBox.rotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w))
    // scene.add(wBox)
  }

  const fixVert = (vert) => {
    const newVert = (new THREE.Vector3())
      .copy(vert)
      .applyEuler(mesh.rotation)

    newVert.x = newVert.x * mesh.scale.x
    newVert.y = newVert.y * mesh.scale.y
    newVert.z = newVert.z * mesh.scale.z

    newVert.x = newVert.x + mesh.position.x
    newVert.y = newVert.y + mesh.position.y
    newVert.z = newVert.z + mesh.position.z

    return newVert
  }

  const sphereHelp = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), randMaterial())
  // TODO option for verts or faces?
  // TODO filtering options, by normal
  // TODO extra verts, etc
  for (let j=0; j < faces.length; j++) {
    const face = faces[j]
    const faceVerts = []
    // const faceVerts = [verts[face.a], verts[face.b], verts[face.c]]
    const a = verts[face.a]
    const b = verts[face.b]
    const c = verts[face.c]

    if (checkVerts(a.clone().applyMatrix4(mesh.matrixWorld))) {
      faceVerts.push(a)
    }
    if (checkVerts(b.clone().applyMatrix4(mesh.matrixWorld))) {
      faceVerts.push(b)
    }
    if (checkVerts(c.clone().applyMatrix4(mesh.matrixWorld))) {
      faceVerts.push(c)
    }

    for (let i=0; i < faceVerts.length; i++) {
      const vert = fixVert(faceVerts[i])

      const direction = face.normal.clone()

      vert.x = vert.x + offset*direction.x
      vert.y = vert.y + offset*direction.y
      vert.z = vert.z + offset*direction.z

      // Get angle from mesh position to this vertex
      const vec = face.normal.clone()
      const up = new THREE.Vector3(0, 1, 0)
      let axis
      if (vec.y === 1 || vec.y === -1 ) {
        axis = new THREE.Vector3(1, 0, 0)
      } else {
        axis = new THREE.Vector3().crossVectors(up, vec)
      }
      const radians = Math.acos(vec.dot(up))
      const mat = new THREE.Matrix4().makeRotationAxis(axis, radians)

      const quat = new THREE.Quaternion().setFromRotationMatrix(mat)

      // Works better for spheres
      // const quat = (new THREE.Quaternion()).setFromUnitVectors(
      //   desiredRotation,
      //   (new THREE.Vector3()).copy(vert).normalize()
      // )

      // Add some random spin
      if (randomSpin) {
        quat.multiply((new THREE.Quaternion()).setFromAxisAngle(Y_AXIS, Math.random()*Math.PI))
      }
      if (rot) {
        // console.log(vert.x)
        if (vert.x > 0)
          quat.multiply(rot[0])
        else if (vert.x < 0)
          quat.multiply(rot[1])
      }

      // Update goblinBox position to current vertex
      // goblinBox.position = new Goblin.Vector3(
      //   vert.x - block.geometry.boundingBox.min.x,
      //   vert.y - block.geometry.boundingBox.min.y,
      //   vert.z - block.geometry.boundingBox.min.z
      // )
      goblinBox.position = new Goblin.Vector3(vert.x, vert.y, vert.z)
      goblinBox.rotation.set(quat.x, quat.y, quat.z, quat.w)
      // goblinBox.scale.set(0.8, 0.8, 0.8)
      goblinBox.updateDerived()

      // const sphereH = sphereHelp.clone()
      // sphereH.position.set(vert.x, vert.y, vert.z)
      // scene.add(sphereH)

      // Look for collisions in nearby area using octree search
      const searchResults = octree.search(new THREE.Vector3(vert.x, vert.y, vert.z), boundingRadius*1.5)
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

      if (noCollisions) {
        // TODO this is where the "top" collision comes from. I think.
        // console.log('no collision with vertex %d', i)
        addNewBox(goblinBox)
      }
    }
  }

  return proteins
}
