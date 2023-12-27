uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float iGlobalTime;

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
float printNumber(vec2 position, float number) {
	float fontSize = 180.;
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
	if (tmp > 999.) {
		while(c < 8) a[c++] = 11; // --------
	} else {
		//if(number < 0.) a[c++] = 11; // add - if number is negative
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
	vec2 p = -1.0 + 2.0 * vUv;
	p.x -= position.x;
	p.y -= position.y;
	float result;
	// output number
	for(int i = 0; i < c; i++) {
		result += char(p * 256. / fontSize + vec2(-.5 * float(i), 0.0), digits[a[i]]).x;
	}
	return result;
}

void main( ) {
	vec3 col;
			int s = int(progress);
			float x = float(s);
			vec3 t2 = texture2D(texture2, vUv).xyz;
			vec2 position = vec2(-0.7, -0.55);
			col = mix(col, t2, 1.0);
			col = mix(col, vec3(1.,0.,0.), printNumber(position, x));
			gl_FragColor = vec4(col, 1.0);
}