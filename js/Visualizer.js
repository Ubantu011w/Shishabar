import * as THREE from 'three';

export class Visualizer {
  constructor(mesh) {
    this.mesh = mesh;

    this.listener = new THREE.AudioListener();
    this.mesh.add(this.listener);

    this.sound = new THREE.Audio(this.listener);
    this.loader = new THREE.AudioLoader();

    this.analyser = new THREE.AudioAnalyser(this.sound, 32);
    this.spectrum;
  }
  
  load(path) {
    this.loader.load(path, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.25);
      this.sound.play();
    })
  }

  getFrequency() {
    return this.analyser.getAverageFrequency();
  }
  
  getSpectrum() {
    return this.analyser.getFrequencyData();
  }

  update() {
    const freq = Math.max(this.getFrequency() - 100, 0) / 50 // disregarding anything bellow 100 because dont matter
    this.mesh.material.uniforms.uAudioFrequency.value = freq;
    this.mesh.material.uniforms.spectrum.value = this.getSpectrum();
  }

}