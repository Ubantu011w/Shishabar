import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { Screen } from './Screen.js'

import { gsap } from 'gsap';

let camera, scene, renderer, mixer, mixerFish;
let pointer, raycaster;
let sound;

const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function() {
  console.log("doneLoading");
}

const clock = new THREE.Clock();

const objects = []; //raycast

const helpers = []; //raycast

let screenmode = false;
let screenAboutMode = false;

let tween, controls, center;
let screenProjects, screenAboutme;
let boxingBag;

let meshes = [], clonemeshes = []; // aku aku
let mesh;

const path = 'models/textures/screens/';
const format = '.jpg';

let screens = [ // projects
	new Screen(path + "projectHotel" + format, 'https://github.com/Ubantu011w/hotelcalifornia', null),
  new Screen(path + "projectkor" + format, null, 'https://youtu.be/i1NfbDaRyM0'),
  new Screen(path + "projectPark" + format, 'https://github.com/Ubantu011w/Parking-Radar-Application', null),
  new Screen(path + "projectSwe" + format, 'https://github.com/Ubantu011w/hotelcalifornia', 'https://youtu.be/hfwF2D-lebM'),
  new Screen(path + "projectUnity" + format, 'https://www.youtube.com/watch?v=ZhbVWzS0zP0&list=PLX3B88iPgRHsLoYeM8heYbFqIG5WB-uhV', null),
  0
];

let screensAbout = [
  new THREE.TextureLoader().load("models/textures/screens/aboutStart.jpg"),
  new THREE.TextureLoader().load("models/textures/screens/aboutName.jpg"),
  new THREE.TextureLoader().load("models/textures/screens/aboutSkills.jpg")
]


init();
animate();
moveit();

// first shader test
var tuniform = {
  iGlobalTime:    { type: 'f', value: 0.1 },
};

var mat = new THREE.ShaderMaterial( {
  uniforms: tuniform,
  vertexShader: `varying vec2 vUv; 
  void main()
  {
      vUv = uv;
  
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
  }`,
  fragmentShader: `uniform float iGlobalTime;
  varying vec2 vUv;
  void main()
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = -1.0 + 2.0 *vUv;
  
      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iGlobalTime+uv.xyx+vec3(0,2,4));
  
      // Output to screen
      gl_FragColor = vec4(col,1.0);
  }`,            
} );

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

  /* document.addEventListener( 'pointermove', onPointerMove ); */
  document.addEventListener( 'pointerdown', onPointerDown );

  // model
  const loader = new FBXLoader(loadingManager);
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

        else if (child.name.includes("sign_")) {
          material = new THREE.MeshBasicMaterial({ color: 0x000000});
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
        child.material = mat;
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
        material = mat;
        child.material = material;
      }

      else if (child.name == "boxingScreen3") {
        material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          map: textureLoader.load( '/models/textures/boxingScreen3.jpg' ),
        })
          child.material = material;
      }

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

  
  loader.load( 'models/fbx/aku.fbx', function ( object ) { //Aku Aku

    const positions = combineBuffer( object, 'position' );

    createMesh( positions, 0.5, -26 , 198, 60, Math.random() * 0xfffffff);

    objects.push(object);

  });

  loader.load( 'models/fbx/fish.fbx', function ( object ) { // fish

    object.traverse( function ( child ) {
      mixerFish = new THREE.AnimationMixer( object );
      const action = mixerFish.clipAction( object.animations[ 0 ] );
      action.play();

      if ( child.isMesh && child.name == "fish") {
        const material = new THREE.MeshBasicMaterial({
              color: 0xff0011,
            });
        child.material = material;
      }

    });
    scene.add(object);
  });
}
var destroyAku = false;

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
    destroyAku = true;
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'models/sounds/vanish.mp3', function( buffer ) {
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
        screenAboutme.material.map = screensAbout[0];
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
    screenProjects.material = new THREE.MeshBasicMaterial({map: screens[i].texture})
    screens[5] = i;
  }

  else if (name.includes("about")) {
    switch (name) {
      case "aboutStart":
        if (!screenAboutMode) {
          screenAboutme.material.map = screensAbout[1];
          screenAboutMode = true;
        }
        break;
      case "aboutNext":
        if (screenAboutMode)
        screenAboutme.material.map = screensAbout[2]
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
  if (tuniform)
    tuniform.iGlobalTime.value += delta;
  if (mesh)
    render()

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

    mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 1, color: color } ) );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
    mesh.name = "AkuAku";
    objects.push(mesh);

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

    if (destroyAku) {


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
        sound.play();
        });
        
      } else {

        data.delay -= 1;

      }

    }

    // all vertices up
      if ( data.verticesUp >= count ) {
      if ( data.delay <= 0 ) {  
        destroyAku = false;
        data.direction = - 1;
        data.speed = 50;
        data.verticesUp = 0;
        data.delay = 350;


      } else {

        data.delay -= 1;

      }

    }

    positions.needsUpdate = true;
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
      break;
    case 1: // projects
      controls.minDistance = 10.0,
      controls.maxDistance = 100.0
      break;
    case 2: // aboutme
      controls.minDistance = 200;
      controls.maxDistance = 400;
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
}

function moveit() {
  controls.minDistance = -Infinity;
  controls.maxDistance = Infinity;
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

  gsap.to(camera.position, { 
    duration: 1.5,
    ease: "power1.inOut",
    x: -1.27,
    y: 195,
    z: 130, 
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
  gsap.to(camera.position, { // arcade
    duration: 1.5,
    ease: "power1.inOut",
    x: main.x - 140,
    y: main.y + 50,
    z: main.z, // maybe adding even more offset depending on your model
    onComplete: () => SetControlsLimit(2)
  })
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