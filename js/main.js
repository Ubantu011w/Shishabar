import * as THREE from 'three';

import { OrbitControls } from 'three/addons/OrbitControls.js';
let controls;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor (0x00000, 1);
document.body.appendChild( renderer.domElement );

controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional

const geometry = new THREE.BoxGeometry( 1, 1, 1 );

const material = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube } );
//
const colors = [];

const color = new THREE.Color();
for (let i = 0; i < 6; i++) { // for faces
  color.set( Math.random() * 0xffffff );
  for (let j = 0; j < 4; j++) { // for vertices
    colors.push(color.r, color.g, color.b);
  }
}
geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3) ); 
const geometry2 = geometry.clone();
const geometry3 = geometry.clone();
//

const cube = new THREE.Mesh( geometry, material );

scene.add( cube );

const cube2 = new THREE.Mesh( geometry2, material );
cube2.position.x = 3;

scene.add( cube2 );

const cube3 = new THREE.Mesh( geometry3, material );
cube3.position.x = -3;

scene.add( cube3 );

camera.position.z = 5;

var light = new THREE.PointLight(0xffffff);
light.position.set(0,250,0);
scene.add(light);

var ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

function animate() { // loop every time the screen is refreshed/ 60 fps
requestAnimationFrame( animate ); // requestAnimationFrame advantages bland annat: pauses when the user navigates to another browser tab
cube.rotation.x += 0.01;
cube.rotation.y += 0.01;
cube2.rotation.x += 0.01;

cube3.rotation.z += 0.01;
controls.update();
renderer.render( scene, camera );
};

animate();