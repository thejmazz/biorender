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

    var aLight = new THREE.AmbientLight(0xf40d0d);
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


var dTime, sTime = (new Date()).getTime();

// Render
function render() {
    stats.begin();

    dTime = (new Date()).getTime() - sTime;
    cube.rotation.y += 0.01;
    // let x = 20 + Math.sin(dTime/2000)*10;
    // let z = 13 + Math.sin(dTime/1000)*10;
    // let y = 7 + Math.sin(dTime/500)*5;
    // light.position.set(x,y,z);
    // sphere.position.set(x,y,z);
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render);
}
