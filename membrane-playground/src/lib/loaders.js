'use strict'

const OBJLoader = new THREE.OBJLoader()
const JSONLoader = new THREE.JSONLoader()

export const textureLoader = new THREE.TextureLoader()

export const JSONLoaderAsync = (url) => {
  return new Promise( (resolve, reject) => {
    JSONLoader.load(url, (geometry, materials) => {
      resolve([geometry, materials])
    })
  })
}

// TODO Promise shim for older browsers
// TODO reject
export const OBJLoaderAsync = (url) => {
  return new Promise( (resolve, reject) => {
    // OBJLoader.load(url, resolve, null, reject)
    OBJLoader.load(url, resolve)
  })
}
