'use strict';
/* globals require, window, document */

import Stats from 'stats.js';
import THREE from 'three';
import requestAnimationFrame from 'raf';
import OrbitControls from 'three-orbit-controls';

var loader = new THREE.JSONLoader();
function loaderPromise(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, function(geometry, materials) {
            resolve(geometry, materials);
        });
    });
}


var stats, scene, renderer, camera, cube;
function init() {
    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    // Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    // Objects
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1;
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

    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    var controls = new(new OrbitControls(THREE))(camera);

    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(new THREE.Vector3());
}


var protein, geometry, materials;
function createProtein() {
    geometry.computeBoundingBox();
    protein = new THREE.Mesh(
        geometry,
        new THREE.MeshNormalMaterial()
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
        scene.add(dimerI);
    }
}

loaderPromise('/models/ATP-synthase.json').then(function(geo, mat) {
    // Remove loading
    var loading = document.getElementById('loading');
    loading.remove();

    // Initialize scene
    init();

    // Make loaded model available
    geometry = geo;
    materials = mat;

    // Create dimer from loaded model
    createProtein();

    // ==== Render ====
    render();
});


// Render
function render() {
    stats.begin();

    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render);
}
