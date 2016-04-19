# threejs-starter-pack

Get up and going with

- [three.js](http://threejs.org/) (R75)
- [stats.js](https://github.com/mrdoob/stats.js/)
- [dat.gui](https://github.com/dataarts/dat.gui)
- works with [three.js inspector](https://chrome.google.com/webstore/detail/threejs-inspector/dnhjfclbfhcbcdfpjaeacomhbdfjbebi?hl=en)

using

- [ES2015](https://babeljs.io/docs/plugins/preset-es2015/)
- [webpack](https://webpack.github.io/)
- [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)

## Running

`npm start` in one tab and `npm run serve` in another.

## Structure

```
.
├── README.md
├── dist
│   ├── bundle.js
│   ├── bundle.js.map
│   └── index.html
├── package.json
├── src
│   ├── index.html
│   ├── index.js
│   └── scene
│       └── index.js
└── webpack.config.js
```

`src/index.js` is responsible for initializing the scene, and populating it
using `Object3D`s exported from `src/scene/index.js`. Each `Object3D` can
attach a function to the `keyframe` key, change properties through closures,
and these keyframe functions will be ran in the render loop. Consider this
example scene:

```js
export default () => {
  const boxGeom = new THREE.BoxGeometry(1, 1, 1)
  const normalMat = new THREE.MeshNormalMaterial()

  const box = new THREE.Mesh(boxGeom, normalMat)

  box.keyframe = () => {
    box.rotation.x += 0.01
    box.rotation.y += 0.01
  }

  return({ box })
}
```

In this way, you can keep animation properties close to your meshes, instead
of relying on accessing global variables for your objects in the render loop.


## Coming soon

- screen auto resize
- [ccapture.js](https://github.com/spite/ccapture.js/)
- [three-glslify](https://www.npmjs.com/package/three-glslify)
- callback free loading
- option to add resource to initial load queue
- easy to use web audio context
- [shader editor chrome extension](https://chrome.google.com/webstore/detail/shader-editor/ggeaidddejpbakgafapihjbgdlbbbpob)
- [pollinate](https://github.com/howardroark/pollinate) template
