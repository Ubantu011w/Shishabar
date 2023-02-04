import * as THREE from 'three';

export class Screen {

  constructor(path, sourceLink, VideoLink) {

    this.texture = new THREE.TextureLoader().load(path);
    this.source = sourceLink;
    this.VideoLink = VideoLink;
    
  }
}