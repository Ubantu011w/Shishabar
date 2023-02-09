import * as THREE from 'three'

class Gradient  {
	constructor( mesh ) {
        this.shader = Gradient.Shader;
        this.material = new THREE.ShaderMaterial( {
            uniforms: THREE.UniformsUtils.merge( [
                {
                    opacity: {
                        value: 0.1
                    }
                },
                this.shader.uniforms
            ] ),
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
        } );
        mesh.material = this.material;
        this.updateGlobal();
    }
    updateGlobal() {
        this.material.uniforms.iGlobalTime.value += 0.01;
    }
}

/* Rays.prototype.constructor = Rays; */

Gradient.Shader = {

	uniforms: {
        iGlobalTime:    { type: 'f', value: 0.1 },
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

        'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );',
        
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'
	].join( '\n' ),

	fragmentShader: [
		'uniform float iGlobalTime;',

		'varying vec2 vUv;',

		'void main() {',

		'	vec2 uv = -1.0 + 2.0 *vUv;',

        'vec3 col = 0.5 + 0.5*cos(iGlobalTime+uv.xyx+vec3(0,2,4));',

		'	gl_FragColor = vec4(col,1.0);',

		'}'
	].join( '\n' )
};

export { Gradient };