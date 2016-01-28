'use strict';
/* globals require, window, document, console, THREE */

import Promise from 'bluebird';
import co from 'co';
import Stats from 'stats.js';
// import THREE from 'three';
import requestAnimationFrame from 'raf';
import OrbitControls from 'three-orbit-controls';


var loader = new THREE.JSONLoader();

function loadModel(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve);
    });
}

var domains = [];
let buildProtein = co.wrap(function *() {
    let geoms = yield Promise.all([
        loadModel('/models/ATP-synthase_d0.25_f1-redish-dark-front.json'),
        loadModel('/models/ATP-synthase_d0.25_f1-redish-front.json'),
        loadModel('/models/ATP-synthase_d0.25_OSAP.json'),
        loadModel('/models/ATP-synthase_d0.25_stator-base.json'),
        loadModel('/models/ATP-synthase_d0.25_axel-front.json'),
        loadModel('/models/ATP-synthase_d0.25_stator-blue-dark.json'),
        loadModel('/models/ATP-synthase_d0.25_axel_origin.json'),
        loadModel('/models/ATP-synthase_d0.25_stator-blue-med.json')
    ]);

    let ATPS = new THREE.Object3D();

    geoms.forEach(function(geom, i) {
        domains.push(new THREE.Mesh(
            geom,
            new THREE.MeshLambertMaterial({color: ((i+1)*(255/geoms.length))/1 * 0xffffff})
        ));

        if (i === 6) {
            domains[i].position.set(0, -6.46, 5);
            domains[i].rotation.x = -0.68;
        }

        ATPS.add(domains[i]);
    });

    ATPS.position.set(-15,12,0);
    scene.add(ATPS);
});


var start = co.wrap(function *start() {
    let model = yield loadModel('/models/ATP-synthase-0.25.json');

    // Initialize scene
    init();

    yield buildProtein();

    // Make loaded model available
    geometry = model;
    // materials = models[0].material;

    // Create dimer from loaded model
    createProtein();

    console.log(domains);

    // ==== Render ====
    render();
});

start();


var stats, scene, renderer, camera, cube, light, sphere;

function init() {
    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    // Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    // Objects
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1;
    cube.position.z = 3200;
    // cube.matrixAutoUpdate = false;
    scene.add(cube);

    var planeGeom = new THREE.PlaneGeometry(1500, 500, 100, 100);
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xacacac
    });
    var planeWireframe = new THREE.MeshBasicMaterial({
        color: 0x5e5e5e,
        wireframe: true
    });
    var plane = new THREE.SceneUtils.createMultiMaterialObject(planeGeom, [planeMaterial, planeWireframe]);

    plane.position.z = 3200;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    var nucleusGeom = new THREE.SphereGeometry(2500, 100, 100);
    var nucleus = new THREE.SceneUtils.createMultiMaterialObject(nucleusGeom, [
        new THREE.MeshBasicMaterial({color: 0x84c2c2, wireframe: true})
    ]);
    scene.add(nucleus);

    var cellGeom = new THREE.SphereGeometry(10000, 100, 100, 0, Math.PI*2, Math.PI/2, Math.PI);
    var cell = new THREE.SceneUtils.createMultiMaterialObject(cellGeom, [
        new THREE.MeshNormalMaterial({wireframe: true})
    ]);
    scene.add(cell);

    var controls = new(new OrbitControls(THREE))(camera);

		// controls.addEventListener( 'change', render );

    camera.position.set(-15, 8, -8 + 3200);
    camera.lookAt(new THREE.Vector3(0,0,3200));

    var aLight = new THREE.AmbientLight(0x404040);
    scene.add(aLight);

    light = new THREE.PointLight(0xffffff, 1, 100);
    sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 10),
        new THREE.MeshBasicMaterial({color:0xffffff})
    );
    // sphere.position.set(10,10,25);
    // light.position.set(10, 10, 25);
    // scene.add(light);
    // scene.add(sphere);

    camera.add(light);
    // camera.add(sphere);
    light.position.set(0,0,-10);
    sphere.position.set(0,0,-10);
    scene.add(camera);
}


var protein, geometry, materials;

function createProtein() {
    geometry.computeBoundingBox();
    protein = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({color: 0x2194cf})
    );
    protein.position.y = Math.abs(protein.geometry.boundingBox.min.y);

    var dimer = new THREE.Object3D();

    dimer.add(protein);

    var protein2 = protein.clone();

    protein2.position.z += 25;
    protein2.rotation.y += Math.PI;
    dimer.add(protein2);

    for (let i = 0; i < 3; i++) {
        var dimerI = dimer.clone();
        dimerI.position.x = i * 20;
        dimerI.position.z = 3200;
        scene.add(dimerI);
    }
}


var dTime, sTime = (new Date()).getTime();

// Render
function render() {
    stats.begin();
    dTime = (new Date()).getTime() - sTime;

    cube.rotation.y += 0.01;

    // domains[6].position.x = Math.sin(dTime/2000)*5;
    domains[6].rotation.y += 0.01;

    // let x = 20 + Math.sin(dTime/2000)*10;
    // let z = 13 + Math.sin(dTime/1000)*10;
    // let y = 7 + Math.sin(dTime/500)*5;
    // light.position.set(x,y,z);
    // sphere.position.set(x,y,z);

    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render);
}
