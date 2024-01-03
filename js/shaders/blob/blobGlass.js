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
            'vec2 uv = vUv;',
"            vec3 col;",
"            if (uv.y > .5) {",
"                col = vec3(0.95,  uv.y - 0.6 , 0.0);",
"                gl_FragColor = vec4(col, 0.5);",
"            }",
"            else {",
"                col = vec3(0.95,  1. - uv.y - 0.6 , 0.0);",
"                gl_FragColor = vec4(col, 0.5);",
"            }",
        
        '}'].join( '\n' )
};

export { blobGlass };