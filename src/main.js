'use strict';
/* globals window, document */

import Stats from 'stats.js';
import THREE from 'three';
import requestAnimationFrame from 'raf';
var OrbitControls = require('three-orbit-controls')(THREE);

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
// cube.matrixAutoUpdate = false;
scene.add(cube);

var planeGeom = new THREE.PlaneGeometry(1000,1000, 100, 100);
var planeMaterial = new THREE.MeshBasicMaterial({color: 0x252323, wireframe: true});
var plane = new THREE.Mesh(planeGeom, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// var axisHelper = new THREE.AxisHelper( 5 );
// scene.add( axisHelper );


var controls = new OrbitControls(camera);

camera.position.z = 20;
camera.position.y = 10;
camera.lookAt( new THREE.Vector3());


// Render
function render() {
    stats.begin();

    // cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render);
}
render();
