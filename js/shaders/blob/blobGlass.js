import * as THREE from 'three'

class blobGlass  {
	constructor( mesh ) {
        this.shader = blobGlass.Shader;
        this.material = new THREE.ShaderMaterial( {
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            transparent: true
        } );
        mesh.material = this.material;
    }
}

blobGlass.Shader = {
	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

        'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );',
        
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'
	].join( '\n' ),

	fragmentShader: [
		'varying vec2 vUv;',
        
        'void main()',
        '{',
            'vec2 uv = -1.0 + 2.0 *vUv;',
            'uv = uv + 0.5;',
            'vec3 col = vec3(0.9,  uv.y - 0.7, 0.25);',
            
            'gl_FragColor = vec4(col, 0.35);',
        
        '}'].join( '\n' )
};

export { blobGlass };