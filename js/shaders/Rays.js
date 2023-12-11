import * as THREE from 'three'

class Rays  {
	constructor( mesh ) {
        this.shader = Rays.Shader;
        this.material = new THREE.ShaderMaterial( {
            uniforms: THREE.UniformsUtils.merge( [
                {
                    opacity: {
                        value: 0.5
                    }
                },
                this.shader.uniforms
            ] ),
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            transparent: true
        } );
        mesh.material = this.material;
        this.updateGlobal();
    }
    updateGlobal() {
        this.material.uniforms.iGlobalTime.value += 0.01;
    }
}

Rays.Shader = {

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
        
       ' float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)',
        '{',
            'vec2 sourceToCoord = coord - raySource;',
            'float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);',
            
            'return clamp(',
                '(0.45 + 0.15 * sin(cosAngle * seedA + iGlobalTime * speed)) +',
                '(0.3 + 0.2 * cos(-cosAngle * seedB + iGlobalTime * speed)),',
                '0.0, 1.0) *',
                'clamp((1.0 - length(sourceToCoord)) / 1.0, 0.5, 1.0);',
        '}',
        
        'void main()',
        '{',
            'vec2 uv = -1.0 + 2.0 *vUv;',
            'uv.y = 1.0 - uv.y;',
            'vec2 coord = vec2(vUv.x, vUv.y);',
            
            
            // Set the parameters of the sun rays
            'vec2 rayPos1 = vec2(1.0 * 0.7, 0.5 * -0.4);',
            'vec2 rayRefDir1 = normalize(vec2(1.0, -0.116));',
            'float raySeedA1 = 50.2214;',
            'float raySeedB1 = 21.11349;',
            'float raySpeed1 = 2.5;',
            
            'vec2 rayPos2 = vec2(1.0 * 0.8, 0.5 * -0.6);',
            'vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));',
            'const float raySeedA2 = 50.39910;',
            'const float raySeedB2 = 18.0234;',
            'const float raySpeed2 = 2.1;',
            
            // Calculate the colour of the sun rays on the current fragment
            'vec4 rays1 =',
                'vec4(1.0, 1.0, 1.0, 1.0) *',
                'rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);',
             
            'vec4 rays2 =',
                'vec4(0.0, 1.0, 1.0, 1.0) *',
                'rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);',
            
            'gl_FragColor = rays1 * 0.5 + rays2 * 0.4;',
            
            // Attenuate brightness towards the bottom, simulating light-loss due to depth.
            // Give the whole thing a blue-green tinge as well.
            'float brightness = 0.5 - (coord.y / 0.1);',
            'gl_FragColor.x *= 0.1 + (brightness * 0.8);',
            'gl_FragColor.y *= 0.3 + (brightness * 0.6);',
            'gl_FragColor.z *= 0.5 + (brightness * 0.5);',
        
        '}'].join( '\n' )
};

export { Rays };