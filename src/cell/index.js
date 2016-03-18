'use strict'

import nucleus from './nucleus'
import cube from '../proteins/cube.js'

const cell = new THREE.Mesh(
  new THREE.SphereGeometry(10000, 100, 100, 0, Math.PI*2, Math.PI/2, Math.PI),
  new THREE.MeshNormalMaterial({wireframe: true})
)

// const pLight = new THREE.PointLight(0xff0000, 1, 1000)
// pLight.position.set(0, 200, 0)
// cell.add(pLight)
// const pLightHelper = new THREE.PointLightHelper(pLight, 5)
// cell.add(pLightHelper)

const loader = new THREE.JSONLoader()
loader.load('/models/inner-membrane.json', (geom) => {
  console.log(geom)

  const mitochondria = new THREE.Mesh(
    geom,
    // new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
    // 0x1e832e
    // 0xdf9134
    // 0x490b63
    // 0x9e1238
    // 0x590f49
    // 0xa017a7
    new THREE.MeshLambertMaterial({color: 0x490b63, side: THREE.DoubleSide})
  )



  mitochondria.position.set(2800,0,0)
  // mitochondria.rotation.y = Math.PI / 2
  mitochondria.scale.set(6*37.5, 6*37.5, 6*37.5)
  cell.add(mitochondria)

  const m2 = mitochondria.clone()
  m2.position.set(0,0,0)
  cell.add(m2)

  var bbox = new THREE.BoundingBoxHelper( mitochondria, 0x000000 );
  bbox.update();
  // cell.add( bbox );
  console.log(bbox)
})

const locs = [
    {"x": -2.4000000000000004, "y1": 0.876572662211675, "y2": -1.2176219683910938},
    {"x": -2.24, "y1": 1.2959568887305837, "y2": -0.9429154022250592},
    {"x": -2.08, "y1": 0.6521914975890114, "y2": -1.4603149711769277},
    {"x": -1.9200000000000004, "y1": 1.0489770575398598, "y2": -1.4597969572007656},
    {"x": -1.7600000000000002, "y1": 0.8244134498537627, "y2": -1.4934577280256451},
    {"x": -1.6, "y1": 1.5515197377483476, "y2": -0.7472595421467423},
    {"x": -1.4400000000000002, "y1": 1.4183282704711415, "y2": -1.5011267587628452},
    {"x": -1.2800000000000002, "y1": 0.6781588036090092, "y2": -1.685197009250144},
    {"x": -1.12, "y1": 0.5184114260743655, "y2": -1.6633964184286698},
    {"x": -0.96, "y1": 1.2418649065589213, "y2": -1.5174693675891777},
    {"x": -0.8, "y1": 0.6045088343718543, "y2": -1.612846856907259},
    {"x": -0.6400000000000001, "y1": 1.2963525513063399, "y2": -1.0258525677110215},
    {"x": -0.48, "y1": 0.4060091037595528, "y2": -1.715685176464044},
    {"x": -0.31999999999999984, "y1": 0.6136474531846756, "y2": -1.4064106861067427},
    {"x": -0.16000000000000014, "y1": 0.5524127282188183, "y2": -1.4801966822858792},
    {"x": 0.0, "y1": 1.142755607044578, "y2": -1.6051221703230423},
    {"x": 0.16000000000000014, "y1": 0.44646672074723526, "y2": -1.8127064381409048},
    {"x": 0.3200000000000003, "y1": 1.082790656433981, "y2": -1.1589784680563104},
    {"x": 0.4800000000000004, "y1": 0.23637493379154195, "y2": -1.7987104749709752},
    {"x": 0.6400000000000001, "y1": 1.3098645014117325, "y2": -1.3921679816684294},
    {"x": 0.8000000000000003, "y1": 1.4452381443646702, "y2": -0.6962838926057984},
    {"x": 0.9600000000000004, "y1": 0.594279626897203, "y2": -1.502213476573598},
    {"x": 1.12, "y1": 1.2545187859686873, "y2": -0.8681074569847735},
    {"x": 1.2800000000000002, "y1": 0.8560279497416975, "y2": -1.1738202371269684},
    {"x": 1.4400000000000004, "y1": 1.1342263702178579, "y2": -1.3068176341287732},
    {"x": 1.6000000000000005, "y1": 0.941781670467648, "y2": -1.1487820905548718},
    {"x": 1.7600000000000007, "y1": 0.8913003783025079, "y2": -1.1243327923669113},
    {"x": 1.9200000000000008, "y1": 0.8135135894011984, "y2": -1.40097846094539},
    {"x": 2.08, "y1": 0.8068257979632916, "y2": -1.2690496028141192},
    {"x": 2.24, "y1": 1.1572622556429506, "y2": -1.0644396309475237},
    {"x": 2.4000000000000004, "y1": 1.0441441984716004, "y2": -1.0471585630356628}
]

loader.load('/models/ATP-synthase_d0.25.json', (geom) => {
  const norm = new THREE.MeshNormalMaterial()
  norm.shading = THREE.FlatShading

  const synthase = new THREE.Mesh(
      geom,
      norm
  )

  locs.forEach( (loc) => {
    // let s = new THREE.Mesh(
    //   new THREE.SphereGeometry(5, 20, 20),
    //   new THREE.MeshNormalMaterial()
    // )
    const s = synthase.clone()

    s.position.set(loc.x*6*37.5, 0, loc.y1*6*37.5*-1 + 225)
    s.rotation.y = Math.PI

    cell.add(s)


    // let t = new THREE.Mesh(
    //   new THREE.SphereGeometry(5, 20, 20),
    //   new THREE.MeshNormalMaterial()
    // )

    const t = synthase.clone()

    t.position.set(loc.x*6*37.5, 0, loc.y2*6*37.5*-1 - 225)

    cell.add(t)
  })
})


cell.add(nucleus)
cell.add(cube)

export default cell
