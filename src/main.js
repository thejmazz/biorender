'use strict';
/* globals require, window, document */

import Stats from 'stats.js';
import THREE from 'three';
import requestAnimationFrame from 'raf';
import OrbitControls from 'three-orbit-controls';

var loader = new THREE.JSONLoader();

// Stats
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// Scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// Objects
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
// cube.matrixAutoUpdate = false;
scene.add(cube);

var planeGeom = new THREE.PlaneGeometry(1000,1000, 100, 100);
var planeMaterial = new THREE.MeshBasicMaterial({color: 0xacacac});
var planeWireframe = new THREE.MeshBasicMaterial({color: 0x5e5e5e, wireframe: true});
var plane = new THREE.SceneUtils.createMultiMaterialObject(planeGeom, [planeMaterial, planeWireframe]);

plane.rotation.x = -Math.PI / 2;
scene.add(plane);

var controls = new (new OrbitControls(THREE))(camera);

camera.position.z = 5;
camera.position.y = 2;
camera.lookAt( new THREE.Vector3());

// var axisHelper = new THREE.AxisHelper( 5 );
// scene.add( axisHelper );


var protein, dimer;
loader.load('/models/ATP-synthase.json', function(geometry, materials) {
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

    var bBox = new THREE.BoundingBoxHelper(dimer);
    bBox.update();

    scene.add(bBox);
    // scene.add(dimer);

    for (let i=0; i < 2; i++) {
        for (let j=0; j < 2; j++) {
            var dimerN = dimer.clone();
            dimerN.position.x = -50 + i*20;
            dimerN.position.z = -50 + j*50;

            scene.add(dimerN);
        }
    }
});


// Render
function render() {
    stats.begin();

    cube.rotation.y += 0.01;
    if (dimer) {
        dimer.rotation.y += 0.01;
        // protein.applyMatrix(dimer.matrixWorld);
        // dimer.rotateOnAxis(new THREE.Vector3(0,1,0), 0.01);
    }
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render);
}
render();
