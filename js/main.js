import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { MeshPhysicalNodeMaterial, add, mul, normalWorld, timerLocal, mx_noise_vec3, mx_worley_noise_vec3, mx_cell_noise_float, mx_fractal_noise_vec3 } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';

import { Screen } from './Screen.js'

/* import TransitionVertexShader from '/shaders/vertex.glsl'
import TransitionFragmentShader from '/shaders/fragment.glsl' */

import { gsap } from 'gsap';

let camera, scene, renderer, mixer;
let pointer, raycaster;
let sound;

const clock = new THREE.Clock();

const objects = []; //raycast

const helpers = [];

let screenmode = false;
let screenAboutMode = false;

let tween, controls, center;
let screenProjects, screenAboutme;
let Aku, boxingBag;

let meshes = [], clonemeshes = []; // aku aku
let mesh;

const path = 'models/textures/screens/';
const format = '.jpg';

let screens = [
	new Screen(path + "projectHotel" + format, 'https://github.com/Ubantu011w/hotelcalifornia', null),
  new Screen(path + "projectkor" + format, null, 'https://youtu.be/i1NfbDaRyM0'),
  new Screen(path + "projectPark" + format, 'https://github.com/Ubantu011w/Parking-Radar-Application', null),
  new Screen(path + "projectSwe" + format, 'https://github.com/Ubantu011w/hotelcalifornia', 'https://youtu.be/hfwF2D-lebM'),
  new Screen(path + "projectUnity" + format, 'https://www.youtube.com/watch?v=ZhbVWzS0zP0&list=PLX3B88iPgRHsLoYeM8heYbFqIG5WB-uhV', null),
  0
];

init();
animate();
moveit();

function init() {
  const container = document.createElement( 'div' );
  document.body.appendChild( container );
  
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  const listener = new THREE.AudioListener();
  camera.add( listener );
  sound = new THREE.Audio( listener );

  camera.position.set( 182, 40, 0 );
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
          const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: textureLoader.load( '/models/textures/Plane009DiffuseMap.jpg' ),
              });
          child.material = material;
        }

        let material; 
        if (child.name == "ledRed" || child.name == "ledRoof") {
          material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2});
          child.material = material;
        }

        if (child.name == "speakerSet") {
          material = new THREE.MeshStandardMaterial({ color: 0x292929});
          child.material = material;
        }

        if (child.name == "fish") {
          material = new THREE.MeshStandardMaterial({ color: 0xff0000});
          child.material = material;
        }

        else if (child.name == "ledBlue") {
          material = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 5});
          child.material = material;
        }
        else if (child.name == "ledBar") {
          material = new THREE.MeshStandardMaterial({ color: 0x6600ff, emissive: 0x6600ff, emissiveIntensity: 2});
          child.material = material;
        }

        else if (child.name == "bar") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/models/textures/barDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "StreetSign") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/models/textures/StreetSignDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "Sphere010" || child.name == "Sphere012" || child.name == "Sphere014" || child.name.includes("Bulb"))  {
          material = new THREE.MeshStandardMaterial({emissive: 0xffffff, emissiveIntensity: 1});
          child.material = material;
        }

        else if (child.name.includes("sign_")) {
          material = new THREE.MeshBasicMaterial({ color: 0x000000});
          objects.push(child);
          child.material = material;
        }

        else if (child.name == "textProjects" || child.name == "textAbout" || child.name == "textCredits") {
          material = new THREE.MeshPhongMaterial({ color: 0x00ffff});
          child.material = material;
        }

        else if (child.name == "arcade") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/models/textures/arcadeDiffuseMap.jpg' )});
            child.material = material;
            objects.push(child);
        }

        else if (child.name == "dogg") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/models/textures/doggDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "building") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/models/textures/buildingDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "boxingScreen") {
          const video = document.createElement('video');
          video.src = "/models/textures/boxingScreen.mp4";
          video.load();
          video.loop = true;
          video.muted = "muted";
          const texture = new THREE.VideoTexture(video);
          material = new THREE.MeshLambertMaterial({map: texture});
          child.material = material;
          video.play();
        }


        else if (child.name == "textShishaLight" ||  child.name == "textLight1")  {
          material = new THREE.MeshStandardMaterial({emissive: 0x00FFD8, emissiveIntensity: 2});
          child.material = material;
        } 
    
        else if (child.name == "aquiriumGlass" || child.name == "beerGlass") {
          material = new THREE.MeshPhysicalMaterial({ // material for water balloon
            roughness: 0.110,
            clearcoat: 1,
            transmission: 1,
          })
          child.material = material;
      }

      else if (child.name == "textShisha") {
        material = new THREE.MeshStandardMaterial({color: 0x000000, emissive: 0xFF0000, emissiveIntensity: 5});
        child.material = material;
        tween = gsap.to(child.material, {
          duration: 5,
          repeat: -1,
          emissiveIntensity: 0.2
        })
        tween.play();
      }

      else if (child.name == "board") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/models/textures/board.jpg' )});
          child.material = material;
      }

      else if (child.name == "screenAboutme") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/models/textures/screens/aboutStart.jpg' ),
        })
          child.material = material;
          screenAboutme = child;
          center = new THREE.Box3().setFromObject( child );
      }

      else if (child.name == "screenProjects") {
        material = new THREE.MeshBasicMaterial({color: 0xffffff, map: textureLoader.load('/models/textures/screens/projectHotel.jpg')});
        child.material = material;
        screenProjects = child;
      }
      
      else if (child.parent.name == "helpers") { // helpers are buttons we turn invisible
        child.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
        helpers.push(child);
      }

      else if (child.name == "hologram") {
        const offsetNode = timerLocal();
        const customUV = add( mul( normalWorld, 100 ), offsetNode );
        let noiseMaterial = new MeshPhysicalNodeMaterial();
        noiseMaterial.colorNode = mx_noise_vec3( customUV );
        
        child.material = noiseMaterial;
      }

      else if (child.name == "boxingBag") {
        boxingBag = child;
        objects.push(boxingBag);
      }

      else if (child.name == "tablet") {
        objects.push(child);
      }

      else if (child.name == "arcadePack") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/models/textures/arcadePackDiffuseMap.jpg' ),
        })
          child.material = material;
          screenAboutme = child;
      }

      else if (child.name == "boxingScreen2") {
        const video = document.createElement('video');
        video.src = "/models/textures/boxingScreen2.mp4";
        video.load();
        video.loop = true;
        video.muted = "muted";
        const texture = new THREE.VideoTexture(video);
        material = new THREE.MeshLambertMaterial({map: texture});
        child.material = material;
        video.play();
      }

    } else {
    }
  
  });
      scene.add( object );
  } );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
  controls.target.set( 0, 0.5, 0 );
  controls.enablePan = false;
  controls.enableDamping = true;

  window.addEventListener( 'resize', onWindowResize );

  //Aku Aku

  loader.load( 'models/fbx/aku.fbx', function ( object ) {

    const positions = combineBuffer( object, 'position' );

    createMesh( positions, 1,  -26 , 196, 60, 0xffffff );

  } );
}

function onPointerMove( event ) {

/*   pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );
 */
}

function onPointerDown( event ) {

  if (event.button == 0) {
  pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );

  if ( intersects.length > 0  && !screenmode) {
    const intersect = intersects[ 0 ];
    /* intersect.object.material = new THREE.MeshPhongMaterial({emissive: 0xffffff, emissiveIntensity: 1}); */
    screenmode = true;
    switch (intersect.object.name) {
      case ("sign_projects"):
      case ("tablet"):
        moveToProjects(1.5);
        break;
      case ("sign_about"):
      case ("arcade"):
        moveToAboutme(1.5);
        break;
      case ("sign_credits"):
      case ("boxingHelper"):
        moveToCredits(1.5);
        break;
      default:
      break;
  }

  if (intersect.object.name == "AkuAku") {
    destroyAku();
    screenmode = false;
  }

  else if (intersect.object == boxingBag) {
    gsap.to(boxingBag.rotation,{
        duration: 0.3, 
        z: Math.PI / 2,
        onComplete: () => {
          setTimeout(() => {
            gsap.to(boxingBag.rotation,{
              duration: 0.2, 
              z: Math.PI,
            })
          }, 5000)
        }
      })

    screenmode = false;
  }
  
  } else if (screenmode) {
    const intersects = raycaster.intersectObjects( helpers, false );
    if (intersects.length > 0) {
      const intersect = intersects[ 0 ];
      if (intersect.object.name.includes("Back")) {
        screenmode = false;
        screenAboutMode = false;
        screenAboutme.material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path + "aboutStart" + format)});
        moveit();
      }
      else if (intersect.object.name == 'projectVideo' || intersect.object.name == 'projectSource' || intersect.object.name.includes('com')) {
        let current = screens[5];
        if (intersect.object.name == 'projectSource')
          window.open(screens[current].source, '_blank');
        else if (intersect.object.name == 'projectVideo')
          window.open(screens[current].VideoLink, '_blank');
        else { // link to social media
          switch (intersect.object.name) {
            case 'aboutGitcom':
              window.open('https://github.com/Ubantu011w', '_blank');
              break
            case 'aboutMailcom':
              window.open('mailto:abdulla.ali.0098@gmail.com', '_blank');
              break;
            case 'aboutLinkedcom':
              window.open('https://www.linkedin.com/in/abdulla-abu-ainin', '_blank');
              break
            default:
              break;
          }
        } 
          
      } 
      else {
        changeScreen(intersect.object.name);
      }
    }
  }
  }
}

function moveit() {
  gsap.to(camera.position, { 
    duration: 2, 
    ease: "power1.inOut",
    x: -100,
    y: 250, 
    z: -550,
  })

  gsap.to(controls.target, { 
    duration: 2, 
    ease: "power1.inOut",
    x: 0,
    y: 0.5, 
    z: 0,
  })
  controls.enableZoom = true;
  controls.enableRotate = true;
}

function moveToProjects(duration) {
  gsap.to(camera.position, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -1.27,
    y: 195,
    z: 147, 
  })


  gsap.to(controls.target, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -3.3,
    y: 183,
    z: 90
  })

  controls.enableRotate = false
}

function moveToAboutme(duration) {
  var main = center.getCenter( new THREE.Vector3() );
  gsap.to(camera.position, { // arcade
    duration: 1.5,
    ease: "power1.inOut",
    x: main.x - 120,
    y: main.y + 40,
    z: main.z, // maybe adding even more offset depending on your model
    onUpdate: function() {
      camera.lookAt( main );
    }
  })

  controls.enableRotate = false
}

function moveToCredits(duration) {
  screenmode = false;
  gsap.to(camera.position, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -300,
    y: 80,
    z: 90, 
  })
}

console.log(helpers[0])
function changeScreen(name) {
  const source = helpers.find(element => element.name == 'projectSource');
  const video = helpers.find(element => element.name == 'projectVideo');
  let i;
  if (name.includes("project")) {
    switch (name){
      case "projectHotel":
        i = 0;
        break;
      case "projectkor":
        i = 1;
        break;
      case "projectPark":
        i = 2;
        break;
      case "projectSwe":
        i = 3;
        break;
      case "projectUnity":
        i = 4;
        break;
      default:
      break;
    }
    screenProjects.material = new THREE.MeshBasicMaterial({map: screens[i].texture})
    screens[5] = i;
  }

  else if (name.includes("about")) {
    switch (name) {
      case "aboutStart":
        if (!screenAboutMode) {
          screenAboutme.material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path + "aboutName" + format)});
          screenAboutMode = true;
        }
        break;
      case "aboutNext":
        if (screenAboutMode)
        screenAboutme.material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(path + "aboutSkills" + format)});
        break;
      default:
        break;
    }
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
  controls.update();
  renderer.render( scene, camera );
  if (mesh)
    render()
  nodeFrame.update();
}

function combineBuffer( model, bufferName ) { // copied from webgl_points_dynamic

  let count = 0;

  model.traverse( function ( child ) {

    if ( child.isMesh ) {

      const buffer = child.geometry.attributes[ bufferName ];

      count += buffer.array.length;

    }

  } );

  const combined = new Float32Array( count );

  let offset = 0;

  model.traverse( function ( child ) {

    if ( child.isMesh ) {

      const buffer = child.geometry.attributes[ bufferName ];

      combined.set( buffer.array, offset );
      offset += buffer.array.length;

    }

  } );

  return new THREE.BufferAttribute( combined, 3 );

}

function destroyAku() {

  // why cant you be better



}

function createMesh( positions, scale, x, y, z, color ) {

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', positions.clone() );
  geometry.setAttribute( 'initialPosition', positions.clone() );

  geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

  const clones = [

    [ 6000, 0, - 4000 ],
    [ 5000, 0, 0 ],
    [ 1000, 0, 5000 ],
    [ 1000, 0, - 5000 ],
    [ 4000, 0, 2000 ],
    [ - 4000, 0, 1000 ],
    [ - 5000, 0, - 5000 ],

    [ 0, 0, 0 ]

  ];

  for ( let i = 0; i < clones.length; i ++ ) {

    mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 1, color: 0xFFFFFF } ) );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    mesh.position.x = x + clones[ i ][ 0 ];
    mesh.position.y = y + clones[ i ][ 1 ];
    mesh.position.z = z + clones[ i ][ 2 ];

    scene.add( mesh );

    clonemeshes.push( { mesh: mesh, speed: 10 + Math.random() } );

  }

  meshes.push( {
    mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 50, delay: Math.floor( 200 + 200 * Math.random() ),
    start: Math.floor( 100 + 200 * Math.random() ),
  } );

}

function render() {
  let delta = 10 * clock.getDelta();

  delta = delta < 2 ? delta : 2;

  for ( let j = 0; j < clonemeshes.length; j ++ ) {

    const cm = clonemeshes[ j ];
    cm.mesh.rotation.y += - 0.1 * delta * cm.speed;

  }

    const data = meshes[ 0 ];
    const positions = data.mesh.geometry.attributes.position;
    const initialPositions = data.mesh.geometry.attributes.initialPosition;

    const count = positions.count;

    if ( data.start > 0 ) {

      data.start -= 1;

    } else {

      if ( data.direction === 0 ) {

        data.direction = - 1;

      }

    }

    for ( let i = 0; i < count; i ++ ) {

      const px = positions.getX( i );
      const py = positions.getY( i );
      const pz = positions.getZ( i );

      // falling down
      if ( data.direction < 0 ) {

        if ( py > 0 ) {

          positions.setXYZ(
            i,
            px + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta,
            py + 3.0 * ( 0.25 - Math.random() ) * data.speed * delta,
            pz + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta
          );

        } else {

          data.verticesDown += 1;

        }

      }

      // rising up
      if ( data.direction > 0 ) {

        const ix = initialPositions.getX( i );
        const iy = initialPositions.getY( i );
        const iz = initialPositions.getZ( i );

        const dx = Math.abs( px - ix );
        const dy = Math.abs( py - iy );
        const dz = Math.abs( pz - iz );

        const d = dx + dy + dx;

        if ( d > 1 ) {

          positions.setXYZ(
            i,
            px - ( px - ix ) / dx * data.speed * delta * ( 0.85 - Math.random() ),
            py - ( py - iy ) / dy * data.speed * delta * ( 1 + Math.random() ),
            pz - ( pz - iz ) / dz * data.speed * delta * ( 0.85 - Math.random() )
          );

        } else {

          data.verticesUp += 1;

        }

      }
    }

    // all vertices down
    if ( data.verticesDown >= count ) {

      if ( data.delay <= 0 ) {

        data.direction = 1;
        data.speed = 50;
        data.verticesDown = 0;
        data.delay = 320;

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'models/sounds/appears.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setVolume( 0.5 );
        /* sound.play(); */
        });
        
      } else {

        data.delay -= 1;

      }

    }

    // all vertices up
    if ( data.verticesUp >= count ) {

      if ( data.delay <= 0 ) {

        data.direction = - 1;
        data.speed = 50;
        data.verticesUp = 0;
        data.delay = 350;

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'models/sounds/vanish.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setVolume( 0.5 );
        /* sound.play(); */
        });
      } else {

        data.delay -= 1;

      }

    }

    positions.needsUpdate = true;

}