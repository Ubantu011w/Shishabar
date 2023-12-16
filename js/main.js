import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Gradient } from './shaders/Gradient.js';
import { Rays } from './shaders/Rays.js';
import { Transition } from './shaders/Transition.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

import { Screen } from './Screen.js'

import { gsap } from 'gsap';
import { AkuAku } from './AkuAku.js';

let camera, scene, renderer, mixer, mixerFish;
let pointer, raycaster;
let sound;
let pointerDisable = false;
let button, text; // Start button

renderer = new THREE.WebGLRenderer( { antialias: true } );
const loadingManager = new THREE.LoadingManager();
let ktx2Loader;

let akuAku;

loadingManager.onLoad = function() {
  console.log("doneLoading");
  button.style.visibility = 'visible';
  text.innerHTML = 'Ready.';
  //if (scene)
  akuAku = new AkuAku();
  setTimeout(() => {
    console.log(akuAku.getMeshes().length);
    akuAku.getMeshes().forEach(element => {
      scene.add(element);
    });
  }, 300 )

}

function loadTexture(path) { //ktx2
    return new Promise((resolve, reject) => {
      ktx2Loader.load(path, resolve, undefined, reject);
  });
}

const clock = new THREE.Clock();

const objects = []; //raycast

const helpers = []; //raycast

let screenmode = false;
let screenAboutMode = false;

let tween, controls, center;
let screenProjects, screenAboutme;
let boxingBag;
var grad, rays;



let screens;

// let screensAbout = [
//   new THREE.TextureLoader().load("static/textures/screens/aboutStart.jpg"),
//   new THREE.TextureLoader().load("static/textures/screens/aboutName.jpg"),
//   new THREE.TextureLoader().load("static/textures/screens/aboutSkills.jpg"),
//   0 // current index
// ]

let screensAbout;
// let screensAbout = [
//   ktx2Loader.load(path + "aboutStart.ktx2"),
//   ktx2Loader.load(path + "aboutName.ktx2"),
//   ktx2Loader.load(path + "aboutSkills.ktx2"),
//   0 // current index
// ]

init();
animate();

async function init() {
  ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath( 'transcoders/' );
  ktx2Loader.detectSupport( renderer );
  const path = 'static/textures/screens/';
  const format = '.ktx2';

  screensAbout = [
    await loadTexture(path + "aboutStart" + format),
    await loadTexture(path + "aboutName" + format),
    await loadTexture(path + "aboutSkills" + format),
    0 // current index
  ]

  screens = [
  new Screen(await loadTexture(path + "projectHotel" + format), 'https://github.com/Ubantu011w/hotelcalifornia', null),
  new Screen(await loadTexture(path + "projectkor" + format), null, 'https://youtu.be/i1NfbDaRyM0'),
  new Screen(await loadTexture(path + "projectPark" + format), 'https://github.com/Ubantu011w/Parking-Radar-Application', null),
  new Screen(await loadTexture(path + "projectSwe" + format), 'https://github.com/Ubantu011w/Swevent', 'https://youtu.be/hfwF2D-lebM'),
  new Screen(await loadTexture(path + "projectUnity" + format), 'https://www.youtube.com/watch?v=ZhbVWzS0zP0&list=PLX3B88iPgRHsLoYeM8heYbFqIG5WB-uhV', null),
  0 // current index
  ]

  const container = document.createElement( 'div' ); // outer
  const ButtonContainer = document.createElement( 'div' );
  const SceneContainer = document.createElement( 'div' );
  text = document.createElement( 'p' );
  
  ButtonContainer.className = "innerButton";
  SceneContainer.className = "inner";

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  const listener = new THREE.AudioListener();
  camera.add( listener );
  sound = new THREE.Audio( listener );

  camera.position.set( 182, 40, 0 );
  scene = new THREE.Scene();
  // const axesHelper = new THREE.AxesHelper( 500 );
  // scene.add( axesHelper );
  scene.visible = false;
  button = document.createElement( 'button' );
  button.innerHTML = "Click here to start";
  button.addEventListener ("click", function() {
    text.remove();
    button.remove();
    ButtonContainer.style.opacity = 0;
    scene.visible = true;
    moveit();
  });

  ButtonContainer.addEventListener("transitionend", (event) => {
    if (event.target == ButtonContainer)
      ButtonContainer.remove();
  });

  text.innerHTML = "Loading...";
  button.setAttribute('class', "Start");
  ButtonContainer.appendChild(text);
  ButtonContainer.appendChild(button);

  document.body.appendChild( container );

  scene.background = new THREE.Color( 0x000000 );
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  //const light = new THREE.AmbientLight( {color: 0x404040, Intensity: 1.3} );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  /* document.addEventListener( 'pointermove', onPointerMove ); */
  document.addEventListener( 'pointerdown', onPointerDown );

  // model
  const loader = new FBXLoader(loadingManager);
  loader.load( 'static/models/scene.fbx', function ( object ) {

    mixer = new THREE.AnimationMixer( object );
    
    const textureLoader = new THREE.TextureLoader();
    const action = mixer.clipAction( object.animations[ 0 ] );
    action.play();

    object.traverse( async function ( child ) {
      
      if ( child.isMesh ) {
        if (child.name == "Plane009") {
          const material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,    
                map: textureLoader.load( '/static/textures/Plane009DiffuseMap.jpg' ),
              });
              

/*               let geometry = new THREE.PlaneGeometry( 80, 80 );
              groundMirror = new Reflector( geometry, {
                map: textureLoader.load( '/static/textures/Plane009DiffuseMap.jpg' ),
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x777777ff,
              } );
              groundMirror.position.y = 0.5;
              groundMirror.rotateX( - Math.PI / 2 );
              scene.add( groundMirror ); */

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
            map: textureLoader.load( '/static/textures/barDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "StreetSign") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/static/textures/StreetSignDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name.includes("sign_")) {
          material = new THREE.MeshStandardMaterial({ color: 0x000000});
          objects.push(child);
          child.material = material;
        }

        else if (child.name == "textProjects" || child.name == "textAbout" || child.name == "textCredits") {
          material = new THREE.MeshBasicMaterial({ color: 0x0000ff});
          child.material = material;
        }

        else if (child.name == "arcade") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/static/textures/arcadeDiffuseMap.jpg' )});
            child.material = material;
            objects.push(child);
        }

        else if (child.name == "dogg") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/static/textures/doggDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "building") {
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: textureLoader.load( '/static/textures/buildingDiffuseMap.jpg' )});
            child.material = material;
        }

        else if (child.name == "boxingScreen") {
          const video = document.createElement('video');
          video.src = "/static/textures/boxingScreen.mp4";
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
    
        else if (child.name == "beerGlass" || child.name == "cocktail") {
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
          let texture = await loadTexture("static/textures/board.ktx2");
          material = new THREE.MeshStandardMaterial( { map: texture } );
          child.material = material;
      }

      else if (child.name == "screenAboutme") {
        // material = new THREE.MeshBasicMaterial({
        //   color: 0xffffff,
        //   map: textureLoader.load( '/static/textures/screens/aboutStart.jpg' ),
        // })
          //child.material = material;
          //screenAboutme = child;
          screenAboutme = new Transition(child);
          screenAboutme.setTexture1(screensAbout[0]);
          screenAboutme.setTexture2(screensAbout[1]);
          child.material = screenAboutme.material;
          center = new THREE.Box3().setFromObject( child );
          objects.push(child);
      }

      else if (child.name == "screenProjects") {
        screenProjects = new Transition(child);
        screenProjects.setTexture1(screens[0].texture);
      }
      
      else if (child.parent.name == "helpers") { // helpers are buttons we turn invisible
        child.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
        helpers.push(child);
      }

      else if (child.name == "hologram") {
        if (rays)
          child.material = grad.material
        else {
          grad = new Gradient(child)
        }
      }

      else if (child.name == "aquiriumGlass") {
        if (rays)
        child.material = rays.material
        else {
          rays = new Rays(child)
        }
      }

      else if (child.name == "boxingBag") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/static/textures/boxingBagDiffuseMap.png' ),
        })
          child.material = material;
        boxingBag = child;
        objects.push(boxingBag);
      }

      else if (child.name == "tablet") {
        objects.push(child);
      }

      else if (child.name == "arcadePack") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/static/textures/arcadePackDiffuseMap.jpg' ),
        })
          child.material = material;
          //screenAboutme = child;
      }

      else if (child.name == "boxingScreen2") {
        if (grad)
          child.material = grad.material
        else {
          grad = new Gradient(child)
        }
      }

      else if (child.name == "boxingScreen3") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/static/textures/boxingScreen3.jpg' ),
        })
          child.material = material;
      }

      else if (child.name == "fans" || child.name == "fans2") {
        material = new THREE.MeshBasicMaterial({
          color: 0x808080,
          map: textureLoader.load( '/static/textures/fansDiffuseMap.png' ),
        })

          let light = new THREE.PointLight({color: 0xFF0000, Intensity: 0.1});
          //light.position.set(child.position.getX, child.position.getY, child.position.getZ + 20)
          light.position.setZ(300);
          //scene.add(light);
          
          child.material = material;
      }
    }
  
  });
      scene.add( object );
  } );

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  SceneContainer.appendChild( renderer.domElement );
  container.append(SceneContainer);
  container.append(ButtonContainer);
  // ktx2loader


  controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
  controls.target.set( 0, 0.5, 0 );
  controls.enablePan = false;
  controls.enableDamping = true;

  window.addEventListener( 'resize', onWindowResize );

  loader.load( 'static/models/fish.fbx', function ( object ) { // fish

    object.traverse( function ( child ) {
      mixerFish = new THREE.AnimationMixer( object );
      mixerFish.timeScale = 0.2;
      const action = mixerFish.clipAction( object.animations[ 0 ] );
      action.play();

        const material = new THREE.MeshStandardMaterial({
              map: new THREE.TextureLoader().load("static/textures/fishDiffuseMap.jpg"),
              flatShading: false
            });
        child.material = material;

    });
    scene.add(object);
  });

  // var ktx2Loader = new THREE.KTX2Loader();
  // ktx2Loader.setTranscoderPath( 'static/textures/screens/results' );
  // ktx2Loader.detectSupport( renderer );
  // ktx2Loader.load( 'projectHotel.ktx2', function ( texture ) {

  //   var material = new THREE.MeshStandardMaterial( { map: texture } );

  // }, function () {

  //   console.log( 'onProgress' );

  // }, function ( e ) {

  //   console.error( e );

  // } );
}
var destroyAku = false;



function onPointerMove( event ) {

/*   pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );
 */
}

function onPointerDown( event ) {
  if (!pointerDisable) {
    if (event.button == 0) {
    pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( objects, false );

    if ( intersects.length > 0  && !screenmode) {
      const intersect = intersects[ 0 ];
      /* intersect.object.material = new THREE.MeshPhongMaterial({emissive: 0xffffff, emissiveIntensity: 1}); */
      screenmode = true;
      pointerDisable = true;
      if (intersect.object.name.includes("sign"))
      intersect.object.material = new THREE.MeshStandardMaterial({emissive: 0xffffff, emissiveIntensity: 1});
      switch (intersect.object.name) {
        case ("sign_projects"):
        case ("tablet"):
          moveToProjects(1.5);
          break;
        case ("sign_about"):
        case ("arcade"):
        case ("screenAboutme"):
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
      pointerDisable = false;
      destroyAku = true;
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( 'static/sounds/vanish.mp3', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setVolume( 0.5 );
      sound.play();
      });
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
            pointerDisable = false;
          }
        })

      screenmode = false;
    }
    
    } else if (screenmode) {
      pointerDisable = false;
      const intersects = raycaster.intersectObjects( helpers, false );
      if (intersects.length > 0) {
        const intersect = intersects[ 0 ];
        if (intersect.object.name.includes("Back")) {
          screenmode = false;
          screenAboutMode = false;
          pointerDisable = true;
          transitionAbout(0);
          moveit();
        }
        else if (intersect.object.name == 'projectVideo' || intersect.object.name == 'projectSource' || intersect.object.name.includes('com')) {
          let current = screens[5];
          if (intersect.object.name == 'projectSource') {
            if (screens[current].source)
              window.open(screens[current].source, '_blank');
          }
          else if (intersect.object.name == 'projectVideo') {
            if (screens[current].VideoLink)
              window.open(screens[current].VideoLink, '_blank');
          }
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
}

function changeScreen(name) {
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
    screenProjects.setTexture1(screens[screens[5]].texture);
    screenProjects.setTexture2(screens[i].texture);

    gsap.to(screenProjects.material.uniforms.progress, {value:1,
      duration: 0.5,
      ease: "none",
      onComplete: () => {
        screenProjects.material.uniforms.texture1.value = screens[i].texture
        screenProjects.material.uniforms.progress.value = 0
      }
  })
    screens[5] = i;
  }

  else if (name.includes("about")) {
    switch (name) {
      case "aboutStart":
        if (!screenAboutMode) {
          screensAbout[3] = 0;
          transitionAbout(1);
          screenAboutMode = true;
        }
        break;
      case "aboutNext":
        if (screenAboutMode) {
          screensAbout[3] = 1;
          transitionAbout(2);
        }
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
  if ( mixerFish ) mixerFish.update( delta );
  controls.update();
  renderer.render( scene, camera );
  if (grad)
    grad.updateGlobal();
  if (rays)
    rays.updateGlobal();
  if (akuAku) if (akuAku.isLoaded()) akuAku.render(10 * clock.getDelta());

}

function SetControlsLimit(direction) {
  switch (direction) {
    case 0: // home
      controls.minDistance = 350;
      controls.maxDistance = 800;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2
      controls.enableRotate = true;
      controls.enabled = true;
      break;
    case 1: // projects
      controls.minDistance = 10.0,
      controls.maxDistance = 100.0
      controls.enableRotate = false
      controls.enabled = true;
      break;
    case 2: // aboutme
      controls.minDistance = 200;
      controls.maxDistance = 400;
      controls.enabled = true;
      break;
    case 3: // reset
    gsap.to(controls, {
      duration: 2.5,
      minDistance : 0,
      maxDistance : 0,
      onComplete: () => controls.enableRotate = false
     })
    default:
      break;
  }
  pointerDisable = false;
}

function moveit() { // home
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  controls.enabled = false;
  gsap.to(camera.position, { 
    duration: 2, 
    ease: "power1.inOut",
    x: 200,
    y: 250, 
    z: -550,
    onComplete: () => SetControlsLimit(0) 
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
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  controls.enabled = false;
  gsap.to(camera.position, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -1.27,
    y: 195,
    z: 110, 
    onComplete: () => SetControlsLimit(1) 
  })

  gsap.to(controls.target, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -1.6,
    y: 183,
    z: 90,
  })
}

function moveToAboutme(duration) {
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  var main = center.getCenter( new THREE.Vector3() );
  controls.enableRotate = false;
  controls.enabled = false;
  gsap.to(camera.position, { // arcade
    duration: 1.5,
    ease: "power1.inOut",
    x: main.x - 90,
    y: main.y + 35,
    z: main.z, // maybe adding even more offset depending on your model
    onComplete: () =>  {
      SetControlsLimit(2);
      }
  })
}

function moveToCredits(duration) {
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  screenmode = false;
  gsap.to(camera.position, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -320,
    y: 80,
    z: 120,
    onComplete: () => {
      SetControlsLimit(0)
    }
  });
}

function transitionAbout(i) {
  screenAboutme.setTexture1(screensAbout[screensAbout[3]]);
  screenAboutme.setTexture2(screensAbout[i]);
  screensAbout[3] = i;
  gsap.to(screenAboutme.material.uniforms.progress, {value:1,
    duration: 0.5,
    ease: "none",
    onComplete: () => {
      screenAboutme.material.uniforms.texture1.value = screensAbout[i]
      screenAboutme.material.uniforms.progress.value = 0
    }
  });
}