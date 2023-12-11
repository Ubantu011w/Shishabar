import * as THREE from 'three'

class Transition  {
	constructor( mesh ) {
        this.shader = Transition.Shader;
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
        this.material.uniforms.progress.value += 0.01;
    }

    setTexture1(Texture) {
        this.material.uniforms.texture1.value = Texture;
    }

    setTexture2(Texture) {
        this.material.uniforms.texture2.value = Texture;
    }
}

/* Rays.prototype.constructor = Rays; */

Transition.Shader = {

	uniforms: {
    texture1: {value: null },
    progress: {value: 0 },
    texture2: {value: null },
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'
	].join( '\n' ),

	fragmentShader: [
    'uniform sampler2D texture1;',
    'uniform sampler2D texture2;',
    'uniform float progress;',

		'varying vec2 vUv;',

		'void main() {',

		'	vec4 t1 = texture2D(texture1,vUv);',

    ' vec4 t2 = texture2D(texture2,vUv);',

		'	gl_FragColor = mix(t1, t2, progress);',

		'}'
	].join( '\n' )
};

export { Transition };