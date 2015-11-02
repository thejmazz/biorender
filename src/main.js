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

var axisHelper = new THREE.AxisHelper( 5 );
scene.add( axisHelper );

loader.load('/models/ATP-synthase.json', function(geometry, materials) {
    var material = new THREE.MeshNormalMaterial();
    var obj = new THREE.Mesh(geometry, material);
    obj.position.y += 10;


    var obj2 = new THREE.Mesh(geometry, material);
    obj2.position.y += 10;
    obj2.position.x += 10;
    obj2.position.z += 27;
    // obj2.position.x += 20;
    obj2.rotation.y += Math.PI;

    scene.add(obj);
    scene.add(obj2);
});


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
