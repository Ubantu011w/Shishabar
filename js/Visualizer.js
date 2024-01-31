import * as THREE from 'three';

export class Visualizer {
  constructor(mesh, speakers, camera, text) {
    this.mesh = mesh;
    this.listener = new THREE.AudioListener();
    this.camera = camera;
    this.camera.add(this.listener);
    this.speakers = speakers;
    this.sound = new THREE.PositionalAudio(this.listener);
    this.loader = new THREE.AudioLoader();
    let renderer = new THREE.WebGLRenderer();
    this.format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
    this.fftSize = 512;
    this.analyser = new THREE.AudioAnalyser(this.sound, this.fftSize);
    this.text = document.getElementById('text');
  }
  
  load(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (buffer) => {
          resolve(buffer);
        },
        (progress) => {
          this.text.textContent = `Loading: ${progress.loaded / progress.total * 100}%`
          console.log(`Loading: ${progress.loaded / progress.total * 100}%`);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  play(buffer) {
    this.sound.setBuffer(buffer);
    this.sound.setLoop(true);
    this.sound.setVolume(0.65);
    this.sound.setRefDistance( 150 );
    this.speakers.add(this.sound);
    this.sound.play();
  }

  getFrequency() {
    return this.analyser.getAverageFrequency();
  }
  
  getSpectrum() {
    let data = this.analyser.getFrequencyData();
    // data[0] = data[4]
    // data[1] = data[3]
    // data[45] = data[3]
    return new THREE.DataTexture( data, this.fftSize / 2, 1, this.format);
  } 

  update() {
    this.mesh.material.uniforms.spectrum.value = this.getSpectrum();
    this.mesh.material.uniforms.spectrum.value.needsUpdate = true;
  }

}