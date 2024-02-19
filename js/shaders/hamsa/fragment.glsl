uniform float iGlobalTime;
uniform vec2 u_resolution;
uniform sampler2D texture1;

varying vec2 vUv;
#define PI 3.14159265359
#define BLACK vec3(0)
#define WHITE vec3(1)
#define GRAY vec3(.5)
#define RED vec3(1.,.3,.3)
#define BLUE vec3(.3,.3,1.)
#define GREEN vec3(.3,1.,.3)
#define YELLOW vec3(1.,1.,.3)
bool done = false;
float f;
// From: https://www.shadertoy.com/view/4sBfRd
vec4 char(vec2 p, int c) {
    if (p.x<.0|| p.x>1. || p.y<0.|| p.y>1.) return vec4(0,0,0,1e5);
	return textureGrad( texture1, p/16. + fract( vec2(c, 15-c/16) / 16. ), dFdx(p/16.),dFdy(p/16.) );
}


// Modified from: https://www.shadertoy.com/view/Md23DV
float printNumber(vec2 fragCoord, float number) {
	float fontSize = 27.;
	// init digits
	int digits[12];
	// numbers start at 48 in font map
	for(int i = 0; i <= 9; i++) digits[i] = 48 + i;
	digits[10] = 46; // .
	digits[11] = 45; // -

	int a[15]; // array for digits of number
	int c = 0; // counter for array = length
	float tmp = abs(number);
	// do not display numbers higher than this due to precision issues
	if (tmp > 999999.) {
		while(c < 8) a[c++] = 11; // --------
	} else {
		if(number < 0.) a[c++] = 11; // add - if number is negative
		int v; // current digit
		bool f; // true if first digit > 0 found
		for(int i = 8; i >= -4; i--) {
			v = int(tmp / pow(10., float(i))); // calculate digit
			// omit leading zeros
			if(v > 0 || f) {
				a[c++] = v; // add digits 0-9
				tmp -= float(v) * pow(10., float(i)); // subtract
				f = true;
			}
			//decimal point
			if(i == 0 && abs(number) < 1.) a[c++] = 0; // add 0
			if(i == 0) a[c++] = 10; // add .
		}
		while(a[c-1] == 0) c--; // strip 0
		if(a[c-1] == 10) c--; // strip .
	}
	// coordinate system that starts at bottom left
	// which is independent of aspect ratio
	vec2 p = fragCoord.xy / u_resolution.y;
	float result;
	// output number
	for(int i = 0; i < c; i++) {
		result += char(p * 256. / fontSize + vec2(-.5 * float(i), 0.0), digits[a[i]]).x;
	}
	return result;
}

// cosine based palette, 4 vec3 params
vec3 palette( in float t) {
	// original:
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1., 1., 1.);
  vec3 d = vec3(0.263, 0.416, 0.557);

	// blue:
  // vec3 a = vec3(-1.392, 0.388, 1.448);
  // vec3 b = vec3(-1.312, 0.308, 0.358);
  // vec3 c = vec3(1.460, 1.460, 1.460);
  // vec3 d = vec3(0.000, 0.333, 0.667);

	// gay:
  // vec3 a = vec3(0.388, -0.052, 0.608);
  // vec3 b = vec3(0.500, 0.500, 0.468);
  // vec3 c = vec3(1.888, 2.228, 1.000);
  // vec3 d = vec3(-0.642, 0.333, 0.667);



   return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  //vUv = fragCoord / iResolution (from 0 --> 1)
  vec2 uv = vUv - 0.5; // (from 0.5 to 0.5)
  uv = uv * 2.0;
  vec2 uv0 = uv;

	uv0.y += .45;
  vec3 finalCol = vec3(0.0);

  for (float i=0.0; i < 2.0; i++) {
    uv = fract(uv) - 0.5;
    float d = length(uv) * exp(-length(uv0));

    vec3 col = palette(length(uv0) + i*.4 + iGlobalTime*.4);

    d = cos(d*12. + iGlobalTime) /8.;
    d = abs(d);
    d = pow(0.01 / d, 1.2);

    finalCol += col * d;
  }
  

  gl_FragColor = vec4(finalCol , 1.0);
}