import * as THREE from 'three';

import { OrbitControls } from 'three/addons/OrbitControls.js';
import { FBXLoader } from 'three/addons/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

init();
animate();

function init() {
  const container = document.createElement( 'div' );
  document.body.appendChild( container );
  
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 100, 200, 300 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
/*   scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 ); */

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  // model
  const loader = new FBXLoader();
  loader.load( 'models/fbx/scene.fbx', function ( object ) {

    mixer = new THREE.AnimationMixer( object );
    const textureLoader = new THREE.TextureLoader();

    const action = mixer.clipAction( object.animations[ 0 ] );
    action.play();

    object.traverse( function ( child ) {

      if ( child.isMesh ) {
        if (child.name == "Plane009") {
          const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/Plane009DiffuseMap.jpg' )});
          child.material = material;
        }

        let material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1});
        if (child.name == "ledRed")
          child.material = material;
        else if (child.name == "ledBlue") {
          material = new THREE.MeshPhongMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 1});
          child.material = material;
        }

        else if (child.name == "bar") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/barDiffuseMap.jpg' )});
            child.material = material;
        }
        else if (child.name == "roofShelters") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/roofSheltersDiffuseMap.jpg' )});
            child.material = material;
        }
        else if (child.name == "sofa") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/sofaDiffuseMap.jpg' )});
            child.material = material;
        }
        else if (child.name == "StreetSign") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/StreetSignDiffuseMap.jpg' )});
            child.material = material;
        }

/*         child.castShadow = true;
        child.receiveShadow = true; */

      }

    } );

    scene.add( object );

  } );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 100, 0 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {
  requestAnimationFrame( animate );

  const delta = clock.getDelta();

  if ( mixer ) mixer.update( delta );

  renderer.render( scene, camera );
}