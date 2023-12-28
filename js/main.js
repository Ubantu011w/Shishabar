import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { gsap } from 'gsap';

import { Gradient } from './shaders/Gradient.js';
import { Rays } from './shaders/Rays.js';
import { Transition } from './shaders/Transition.js';
import { Slide } from './shaders/Slide.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';

//visualizer
import vertex from './shaders/basicVisualizer/vertex.glsl?raw'
import fragment from './shaders/basicVisualizer/fragment.glsl?raw'
//trippy
import vertexTrip from './shaders/firstTry/vertex.glsl?raw'
import fragmentTrip from './shaders/firstTry/fragment.glsl?raw'
// boxing
import vertexBoxing from './shaders/boxing/vertex.glsl?raw'
import fragmentBoxing from './shaders/boxing/fragment.glsl?raw'
import fragmentBoxingProgress from './shaders/boxing/fragmentProgress.glsl?raw'

import { Screen } from './Screen.js'
import { AkuAku } from './AkuAku.js';
import { Sound } from './Sound.js';
import { Visualizer } from './Visualizer.js';
import mix from '../sounds/mix.mp3';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let debugMode = false;
let camera, scene, renderer, mixer, mixerFish;
let pointer, raycaster;
let pointerDisable = false;
let button, text; // Start button
let sideScreen;
let finalComposer, bloomComposer, smaaPass;
let visualMaterial, visualizer, tripMaterial, boxingMaterial, boxingProgressMaterial;

let sounds = new Sound();
let speakers;

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
  threshold: 0,
  strength: 1.77,
  radius: 0.42,
  exposure: 1,
  smaaPass: true
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};

renderer = new THREE.WebGLRenderer( { antialias: false } );
const loadingManager = new THREE.LoadingManager();
let ktx2Loader;

let akuAku;



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

let screensAbout;

let boxingScreens;
let sideScreenBoxing;

init();

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

  boxingScreens = 
  [
  await loadTexture(path + "boxingScreen1.ktx2"),
  await loadTexture(path + "boxingScreen2.ktx2"),
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

  camera.position.set( 182, 40, 0 );
  scene = new THREE.Scene();
  // const axesHelper = new THREE.AxesHelper( 500 );
  // scene.add( axesHelper );
  scene.visible = false;


  scene.background = new THREE.Color( 0x000000 );
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  //const light = new THREE.AmbientLight( {color: 0x404040, Intensity: 1.3} );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  document.addEventListener( 'pointermove', onPointerMove );
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
        if (child.name == "ledRoof") {
          material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2});
          child.material = material;
          child.layers.enable( BLOOM_SCENE );

        }

        if (child.name == "ledRed") {
          material = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x00ffff, emissiveIntensity: 2});
          child.material = material;
          child.layers.enable( BLOOM_SCENE );

        }

        else if (child.name == "ledBlue") {
          material = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x00ffff, emissiveIntensity: 2});
          child.material = material;
          child.layers.enable( BLOOM_SCENE );
        }

        if (child.name == "speakerSet") {
          material = new THREE.MeshStandardMaterial({ color: 0x292929});
          child.material = material;
          speakers = child;
        }


        else if (child.name == "ledBar") {
          material = new THREE.MeshStandardMaterial({ color: 0x6600ff, emissive: 0x6600ff, emissiveIntensity: 4});
          child.material = material;
          child.layers.enable( BLOOM_SCENE );

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
          material = new THREE.MeshBasicMaterial({ color: 0x420d00});
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
          // const video = document.createElement('video');
          // video.src = "/static/textures/boxingScreen.mp4";
          // video.load();
          // video.loop = true;
          // video.muted = "muted";
          //const texture = new THREE.VideoTexture(video);
          // material = new THREE.MeshLambertMaterial({map: texture});
          // child.material = material;
          // video.play();
          sideScreenBoxing = new Slide(child);
          child.material = sideScreenBoxing.material;
          sideScreenBoxing.setTexture1(boxingScreens[0]);
        }


        else if (child.name == "textShishaLight" ||  child.name == "textLight1")  {
          material = new THREE.MeshStandardMaterial({emissive: 0x00FFD8, emissiveIntensity: 2});
          child.material = material;
          
        } 
        else if (child.name == "leftBulb" ||  child.name == "rightBulb")  {
          material = new THREE.MeshStandardMaterial({color: 0xfff1ab, emissive: 0xfff1ab, emissiveIntensity: 0.1});
          child.material = material;
          child.layers.enable( BLOOM_SCENE );
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
        child.layers.enable( BLOOM_SCENE );
        if (grad)
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
        child.layers.enable( BLOOM_SCENE );
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
        boxingProgressMaterial = new THREE.ShaderMaterial({
          uniforms: {
            iGlobalTime:    { value: 0.0 },
            progress:    { value: 152 },
          },
          vertexShader: vertexBoxing,
          fragmentShader: fragmentBoxingProgress
        })
        child.material = boxingProgressMaterial;
      }

      else if (child.name == "boxingScreen3") {
        boxingMaterial = new THREE.ShaderMaterial( {
          uniforms: {
            progress:    { value: 152},
            iGlobalTime:    { value: 0.1 },
            texture1: { value: textureLoader.load( '/static/textures/characters.png' ) },
            texture2: { value: textureLoader.load( '/static/textures/boxingScreen3.jpg' ) }
  
        },
          vertexShader: vertexBoxing,
          fragmentShader: fragmentBoxing
        });
          child.material = boxingMaterial;
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
      } else if (child.name == "audioScreen") {
        //visual = new Visual(child);
        visualMaterial = new THREE.ShaderMaterial( {
          side: THREE.DoubleSide,
          transparent: true,
            uniforms: {
              iGlobalTime:    { value: 0.1 },
              texture1: { value: textureLoader.load( '/static/textures/characters.png' ) },
              spectrum: {value: null}
          },
            vertexShader: vertex,
            fragmentShader: fragment
          }
        )
        child.material = visualMaterial;
        visualizer = new Visualizer(child, speakers, camera);
        // boxingMaterial = new THREE.ShaderMaterial( {
        //   uniforms: {
        //     progress:    { value: 0},
        //     iGlobalTime:    { value: 0.1 },
        //     texture1: { value: textureLoader.load( '/static/textures/characters.png' ) },
  
        // },
        //   vertexShader: vertexBoxing,
        //   fragmentShader: fragmentBoxing
        // });
        // const geometry = new THREE.PlaneGeometry( 108, 108 ); 
        // const sphere = new THREE.Mesh( geometry, visualMaterial );
        // scene.add(sphere);
        // sphere.position.set(0,130,-200);
        // sphere.rotateY(Math.PI);
      } else if (child.name == "hamsa") {
          tripMaterial = new THREE.ShaderMaterial( {
              uniforms: {
                iGlobalTime:    { value: 0.1 }
            },
              vertexShader: vertexTrip,
              fragmentShader: fragmentTrip
            }
          )
          child.material = tripMaterial;
      } else if (child.name == "hamsaOutline") {
          tripMaterial = new THREE.MeshBasicMaterial( { color: 0x5e5e5e
            }
          )
          child.material = tripMaterial;
      }
    }
  
  });
      scene.add( object );
  } );

  // bloom

  finalComposer = new EffectComposer( renderer );

  const renderScene = new RenderPass( scene, camera );
  
  finalComposer.addPass( renderScene );
  const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0, 0.1 );
  //bloomPass.threshold = 1;
  bloomComposer = new EffectComposer( renderer );
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass( renderScene );
  bloomComposer.addPass( bloomPass );

  bloomComposer.setSize( window.innerWidth, window.innerHeight );
  finalComposer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
          'vUv = uv;',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
	].join( '\n' ),
      fragmentShader: [
        'uniform sampler2D baseTexture;',
        'uniform sampler2D bloomTexture;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );',
        '}'
      ].join( '\n' ),
      defines: {}
    } ), "baseTexture"
  );
  finalPass.needsSwap = true;
  smaaPass = new SMAAPass(window.innerWidth, window.innerHeight)
  smaaPass.enabled = true;
  smaaPass.needsSwap = true;
  finalComposer.addPass( smaaPass );
  bloomComposer.addPass( smaaPass );
  finalComposer.addPass( finalPass );
  

  bloomPass.threshold = Number( params.threshold );
  bloomPass.strength = Number( params.strength );
  bloomPass.radius = Number( params.radius );
  renderer.toneMappingExposure = Math.pow( params.exposure, 4.0 );

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
        if (child.name == "fishBulb") {
          const material = new THREE.MeshStandardMaterial({color: 0xebcf34, emissive: 0xebcf34, emissiveIntensity: 0.5});
          child.material = material;
          child.layers.enable(BLOOM_SCENE);

        } else if (child.name == "fish") {
          const material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load("static/textures/fishDiffuseMap.jpg"),
            flatShading: false
          });
        child.material = material;

        } else {
        }

    });
    scene.add(object);

  });
  akuAku = new AkuAku();
  await akuAku.loadModel();
  akuAku.getMeshes().forEach(element => {
    element.name = "AkuAku";
    objects.push(element);
    scene.add(element);
  });
  sideScreen = 1;
  button = document.createElement( 'button' );
  button.innerHTML = "Click here to start";
  button.addEventListener ("click", function() {
    text.remove();
    button.remove();
    ButtonContainer.style.opacity = 0;
    scene.visible = true;
    moveit();
    visualizer.load(mix);
  });

  ButtonContainer.addEventListener("transitionend", (event) => {
    if (event.target == ButtonContainer)
      ButtonContainer.remove();
  });

  text.innerHTML = "Loading...";
  button.setAttribute('class', "Start");
  ButtonContainer.appendChild(text);
  ButtonContainer.appendChild(button);
  loadingManager.onLoad = function() {
    console.log("doneLoading");
    button.style.visibility = 'visible';
    text.innerHTML = 'Ready.';
    changeSideScreen()
  }
  document.body.appendChild( container );
  if (debugMode) {
    scene.visible = false;
    ButtonContainer.remove();
    moveit();
    const gui = new GUI();
    
    const bloomFolder = gui.addFolder( 'bloom' );
    
    bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {
    
      bloomPass.threshold = Number( value );
    
    } );
    
    bloomFolder.add( params, 'strength', 0.0, 3 ).onChange( function ( value ) {
    
      bloomPass.strength = Number( value );
    
    } );
    
    bloomFolder.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
    
      bloomPass.radius = Number( value );
    
    } );
    
    const toneMappingFolder = gui.addFolder( 'tone mapping' );
    
    toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
    
      renderer.toneMappingExposure = Math.pow( value, 4.0 );
    
    } );

    const smaaPassFolder = gui.addFolder( 'smaaPass' );
    
    smaaPassFolder.add( params, 'smaaPass' ).onChange( function ( value ) {
      console.log(smaaPass.enabled);
      smaaPass.enabled = value;
    
    } );
}
  animate();
}

function onPointerMove( event ) {

 pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( objects, false );
  if ( intersects.length > 0) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
  }
}

function onPointerDown( event ) {
  document.body.style.cursor = 'default';
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
      akuAku.destroy();

      screenmode = false;
    }

    else if (intersect.object == boxingBag) {
      
      sounds.playPunch();
      gsap.to(boxingBag.rotation,{
          duration: 0.3, 
          z: Math.PI / 2,
          onComplete: () => {
            setTimeout(() => {
              gsap.to(boxingBag.rotation,{
                duration: 0.2, 
                z: Math.PI,
              });
            }, 8000)
            pointerDisable = false;
          }
        })
        let min = 150, max = 999;
        boxingMaterial.uniforms.progress.value = 0;
        boxingProgressMaterial.uniforms.progress.value = 0;
        min = Math.ceil(min);
        max = Math.floor(max);
        let random = Math.floor(Math.random() * (max - min + 1) + min);
        gsap.to([boxingMaterial.uniforms.progress, boxingProgressMaterial.uniforms.progress], {value:random,
          duration: 7,
          ease: "power3.out",
          onComplete: () => {
            boxingMaterial.uniforms.progress.value = random;
          }
      })

      screenmode = false;
    }
    
    } else if (screenmode) {
      pointerDisable = false;
      const intersects = raycaster.intersectObjects( helpers, false );
      if (intersects.length > 0) {
        const intersect = intersects[ 0 ];
        sounds.playBloop();
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
  bloomComposer.setSize( window.innerWidth, window.innerHeight );
  finalComposer.setSize( window.innerWidth, window.innerHeight );
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
  if (akuAku) 
    akuAku.render(10 * clock.getDelta());
  scene.traverse( darkenNonBloomed );
  bloomComposer.render();
  scene.traverse( restoreMaterial );

  // render the entire scene, then render bloom scene on top
  finalComposer.render();

  //let analysis = analyser.getFrequencyData()[2] / 255;

  //console.log(analysis);

  // visual 
  if (visualMaterial) {
    visualMaterial.uniforms.iGlobalTime.value = clock.getElapsedTime();
    visualizer.update();
  } 

  if (tripMaterial) {
    tripMaterial.uniforms.iGlobalTime.value = clock.getElapsedTime();
  }

  if (boxingMaterial) {
    boxingMaterial.uniforms.iGlobalTime.value = clock.getElapsedTime();
  }
  if (boxingProgressMaterial) {
    boxingProgressMaterial.uniforms.iGlobalTime.value = clock.getElapsedTime();
  }

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
  sounds.playWhoosh();
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
  sounds.playClick();
  sounds.playWhoosh();
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  controls.enabled = false;
  gsap.to(camera.position, { 
    duration: duration,
    ease: "power1.inOut",
    x: -1.27,
    y: 188,
    z: 100, 
    onComplete: () => SetControlsLimit(1) 
  })

  gsap.to(controls.target, { 
    duration: duration,
    ease: "power1.inOut",
    x: -1.6,
    y: 183,
    z: 90,
  })
}

function moveToAboutme(duration) {
  sounds.playClick();
  sounds.playWhoosh();
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  var main = center.getCenter( new THREE.Vector3() );
  controls.enableRotate = false;
  controls.enabled = false;
  gsap.to(camera.position, { // arcade
    duration: duration,
    ease: "power1.inOut",
    x: main.x - 90,
    y: main.y + 40,
    z: main.z, // maybe adding even more offset depending on your model
    onComplete: () =>  {
      SetControlsLimit(2);
      }
  })
}

function moveToCredits(duration) {
  sounds.playClick();
  sounds.playWhoosh();
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
  screenmode = false;
  gsap.to(camera.position, { 
    duration: duration,
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

function changeSideScreen()
    {
    if (sideScreenBoxing) {
        switch(sideScreen) {
            case 1:
                slideTransition(
                  sideScreenBoxing.material,
                    boxingScreens[1],
                    7
                )
                sideScreen +=1
                break
            case 2:
                slideTransition(
                  sideScreenBoxing  .material,
                    boxingScreens[0],
                    7
                )
                sideScreen = 1
                break
        }

      }
    }

function slideTransition(material, newTexture, duration) // boxing screen
{
    material.uniforms.texture2.value = newTexture
    gsap.to(material.uniforms.progress, {value:1,
        duration: duration,
        ease: "none",
        onComplete: () => {
            material.uniforms.texture1.value = newTexture
            material.uniforms.progress.value = 0
            changeSideScreen()
        }
    })
}

function darkenNonBloomed( obj ) {

  if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial( obj ) {

  if ( materials[ obj.uuid ] ) {

    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];

  }

}