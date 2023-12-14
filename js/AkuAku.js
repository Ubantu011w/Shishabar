import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
let destroyAku = false;
const listener = new THREE.AudioListener();
let sound = new THREE.Audio( listener );
let clonemeshes = [];
var meshesBackup = [];
var meshes = [];
let loaded = false;

class AkuAku {
  constructor() {
    this.loadModel();
  }
  getMeshes() {
    return meshesBackup;
  }

  isLoaded() {
    return loaded;
  }

  async loadModel() {
    const loadingManager = new THREE.LoadingManager();
    const loader = new FBXLoader(loadingManager);
    const model = await loader.loadAsync('static/models/aku.fbx');
    const positions = this.combineBuffer( model, 'position' );
    this.createMesh( positions, 0.5, -26 , 198, 60, Math.random() * 0xfffffff);
    loaded = true;
  }
  createMesh( positions, scale, x, y, z, color) {
    let mesh;
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
  
      mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 0.5, color: color } ) );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
      mesh.name = "AkuAku";
  
      mesh.position.x = x + clones[ i ][ 0 ];
      mesh.position.y = y + clones[ i ][ 1 ];
      mesh.position.z = z + clones[ i ][ 2 ];
      
      meshesBackup.push(mesh);
      clonemeshes.push( { mesh: mesh, speed: 10 + Math.random() } );
    }
  
    meshes.push( {
      mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 50, delay: Math.floor( 200 + 200 * Math.random() ),
      start: Math.floor( 100 + 200 * Math.random() ),
    } );
  }

  combineBuffer( model, bufferName ) { // copied from webgl_points_dynamic

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

   render(delta) {
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
          audioLoader.load( 'static/sounds/appears.mp3', function( buffer ) {
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

}
export { AkuAku };