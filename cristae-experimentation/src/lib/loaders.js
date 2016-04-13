'use strict'

const OBJLoader = new THREE.OBJLoader()

// TODO Promise shim for older browsers
// TODO reject
export const OBJLoaderAsync = (url) => {
  return new Promise( (resolve, reject) => {
    // OBJLoader.load(url, resolve, null, reject)
    OBJLoader.load(url, resolve)
  })
}
