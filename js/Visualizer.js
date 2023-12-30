import * as THREE from 'three';

export class Visualizer {
  constructor(mesh, speakers, camera) {
    this.mesh = mesh;
    this.listener = new THREE.AudioListener();
    this.camera = camera;
    this.camera.add(this.listener);
    this.speakers = speakers;
    this.sound = new THREE.PositionalAudio(this.listener);
    this.loader = new THREE.AudioLoader();
    let renderer = new THREE.WebGLRenderer();
    this.format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
    this.fftSize = 128;
    this.analyser = new THREE.AudioAnalyser(this.sound, this.fftSize);
  }
  
  load(path) {
    this.loader.load(path, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.65);
      this.sound.setRefDistance( 150 );
      this.sound.play();
    })
    this.speakers.add(this.sound);
  }

  getFrequency() {
    return this.analyser.getAverageFrequency();
  }
  
  getSpectrum() {
    this.analyser.getFrequencyData();
    return new THREE.DataTexture( this.analyser.data, this.fftSize / 2, 1, this.format);
  } 

  update() {
    this.mesh.material.uniforms.spectrum.value = this.getSpectrum();
    this.mesh.material.uniforms.spectrum.value.needsUpdate = true;
  }

}