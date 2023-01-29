import * as THREE from 'three';

import { OrbitControls } from 'three/addons/OrbitControls.js';
import { FBXLoader } from 'three/addons/FBXLoader.js';

let camera, scene, renderer, mixer;
let pointer, raycaster
const clock = new THREE.Clock();

let moving = false;
let zFinal, yFinal, xFinal, z;

const objects = [];

init();
animate();

function init() {
  const container = document.createElement( 'div' );
  document.body.appendChild( container );
  
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 100, 100, 300 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  document.addEventListener( 'pointermove', onPointerMove );
  document.addEventListener( 'pointerdown', onPointerDown );

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

        let material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2});
        if (child.name == "ledRed")
          child.material = material;
        else if (child.name == "ledBlue") {
          material = new THREE.MeshPhongMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 2});
          child.material = material;
        }

        else if (child.name == "bar") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/barDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "StreetSign") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/StreetSignDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "Sphere010" || child.name == "Sphere012" || child.name == "Sphere014" || child.name.includes("Bulb"))  {
          material = new THREE.MeshPhongMaterial({emissive: 0xffffff, emissiveIntensity: 1});
          child.material = material;
        }

        else if (child.name.includes("sign_")) {
          material = new THREE.MeshPhongMaterial({ color: 0x000000});
          objects.push(child);
          child.material = material;
        }

        else if (child.name == "textProjects" || child.name == "textAbout" || child.name == "textCredits") {
          material = new THREE.MeshPhongMaterial({ color: 0x00ffff});
          child.material = material;
        }

        else if (child.name == "arcade") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/arcadeDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "dogg") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/doggDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "building") {
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: textureLoader.load( 'https://raw.githubusercontent.com/Ubantu011w/Shishabar/main/models/textures/buildingDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "boxingScreen") {
          const video = document.getElementById( 'video' );
          const texture = new THREE.VideoTexture( video );
          material = new THREE.MeshLambertMaterial({color: 0x00ffff, map: texture});
          video.play();
          child.material = material;
        }


        else if (child.name == "textShishaLight" ||  child.name == "textLight1")  {
          material = new THREE.MeshPhongMaterial({emissive: 0x00FFD8, emissiveIntensity: 2});
          child.material = material;
        } 
    
        else if (child.name == "aquiriumGlass") {
          material = new THREE.MeshPhysicalMaterial({ // material for water balloon
            roughness: 0.110,
            clearcoat: 1,
            transmission: 1,
          })
          child.material = material;
      }
    
  }});

    scene.add( object );
  } );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
  window.addEventListener( 'resize', onWindowResize );

}

function onPointerMove( event ) {

/*   pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );
 */
}

function onPointerDown( event ) {

  pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );

  if ( intersects.length > 0 ) {
    const intersect = intersects[ 0 ];
    intersect.object.material = new THREE.MeshPhongMaterial({emissive: 0xffffff, emissiveIntensity: 1});
    moving = true;
    xFinal = 200;
    yFinal = 100;
    zFinal = 50;
/*     gsap.to(camera.position, {
      z: 14,
      duration: 1.5
    }); */
  }
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