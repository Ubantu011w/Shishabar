// ---- change here ----
const float USE_KALEIDOSCOPE = 1.0;
const float NUM_SIDES = 6.0;

// math const
const float PI = 3.14159265359;
const float DEG_TO_RAD = PI / 180.0;

uniform sampler2D texture1;
uniform float iGlobalTime;
varying vec2 vUv;

// -4/9(r/R)^6 + (17/9)(r/R)^4 - (22/9)(r/R)^2 + 1.0
float field( vec2 p, vec2 center, float r ) {
	float d = length( p - center ) / r;
	
	float t   = d  * d;
	float tt  = t  * d;
	float ttt = tt * d;
	
	float v =
		( - 4.0 / 9.0 ) * ttt +
		(  17.0 / 9.0 ) * tt +
		( -22.0 / 9.0 ) * t +
		1.0;
	
	return clamp( v, 0.0, 1.0 );
}

vec2 Kaleidoscope( vec2 uv, float n, float bias ) {
	float angle = PI / n;
	
	float r = length( uv );
	float a = atan( uv.y, uv.x ) / angle;
	
	a = mix( fract( a ), 1.0 - fract( a ), mod( floor( a ), 2.0 ) ) * angle;
	
	return vec2( cos( a ), sin( a ) ) * r;
}

void main( )
{
	vec2 uv = vUv - 0.5;
	uv = uv * 2.0;
	vec2 ratio = uv.xy / min( uv.x, uv.y );
	
	// --- Kaleidoscope ---
	uv = mix( uv, Kaleidoscope( uv, NUM_SIDES, iGlobalTime * 0.5 ), USE_KALEIDOSCOPE ); 
	
	vec3 final_color = vec3( 0.0 );
	float final_density = 0.0;
	for ( int i = 0; i < 128; i++ ) {
		vec4 noise  = texture2D( texture1, vec2( float( i ) + 0.5, 0.5 ) / 256.0 );
		vec4 noise2 = texture2D( texture1, vec2( float( i ) + 0.5, 9.5 ) / 256.0 );
		
		// velocity
		vec2 vel = noise.xy * 2.0 - vec2( 1.0 );
		
		// center
		vec2 pos = noise.xy;
		pos += iGlobalTime * vel * 0.2;
		pos = mix( fract( pos ), 1.0 - fract( pos ), mod( floor( pos ), 2.0 ) );
		
		// remap to screen
		pos = ( pos * 2.0 - 1.0 ) * ratio;
		
		// radius
		float radius = clamp( noise.w, 0.3, 0.8 );
		radius *= radius * 0.4;
		
		// color
		vec3 color = noise2.xyz;
		
		// density
		float density = field( uv, pos, radius );

		// accumulate
		final_density += density;		
		final_color += density * color;
	}

	final_density = clamp( final_density - 0.1, 0.0, 1.0 );
	final_density = pow( final_density, 3.0 );

	gl_FragColor = vec4( final_color * final_density, 1.0 );
}