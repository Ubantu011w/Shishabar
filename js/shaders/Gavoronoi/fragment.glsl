varying vec2 vUv;

uniform float iGlobalTime;
#define PI 3.14159265358979
uniform float uAudioFrequency;
uniform sampler2D texture1;
#define GREEN vec3(.3,1.,.3)
#define BLUE vec3(.3,0.,1.)
struct Color {
    vec3 color;
    float position;
};

#define COLOR_RAMP(colors, factor, finalColor) { \
    int index = 0; \
    for(int i = 0; i < colors.length() - 1; i++){ \
       Color currentColor = colors[i]; \
       bool isInBetween = currentColor.position <= factor; \
       index = int(mix(float(index), float(i), float(isInBetween))); \
    } \
    Color currentColor = colors[index]; \
    Color nextColor = colors[index + 1]; \
    float range = nextColor.position - currentColor.position; \
    float lerpFactor = (factor - currentColor.position) / range; \
    finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
} \

vec2 m = vec2(.7,.8);

float hash( in vec2 p ) 
{
    return fract(sin(p.x*15.32+p.y*5.78) * 43758.236237153);
}


vec2 hash2(vec2 p)
{
	return vec2(hash(p*.754),hash(1.5743*p.yx+4.5891))-.5;
}


// Gabor/Voronoi mix 3x3 kernel (some artifacts for v=1.)
float gavoronoi3(in vec2 p)
{    
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float f = 3.*PI;//frequency
    float v = 1.0;//cell variability <1.
    float dv = .0;//direction variability <1.
    vec2 dir = m + cos(iGlobalTime);//vec2(.7,.7);
    float va = 0.0;
   	float wt = 0.0;
    for (int i=-1; i<=1; i++) 
	for (int j=-1; j<=1; j++) 
	{		
        vec2 o = vec2(i, j)-.5;
        vec2 h = hash2(ip - o);
        vec2 pp = fp + o;
        float d = dot(pp, pp);
        float w = exp(-d*4.);
        wt +=w;
        h = dv*h+dir;//h=normalize(h+dir);
        va += cos(dot(pp,h)*f/v)*w;
	}    
    return va/wt;
}

float noise( vec2 p)
{   
    return gavoronoi3(p);
}

float map(vec2 p){
  return 2.*abs( noise(p*2.));
}

vec3 nor(in vec2 p)
{
	const vec2 e = vec2(0.1, 0.0);
	return -normalize(vec3(
		map(p + e.xy) - map(p - e.xy),
		map(p + e.yx) - map(p - e.yx),
		.1));
}
//Debug
//From: https://www.shadertoy.com/view/4sBfRd
vec4 char(vec2 p, int c) {
    if (p.x<.0|| p.x>1. || p.y<0.|| p.y>1.) return vec4(0,0,0,1e5);
	return textureGrad( texture1, p/16. + fract( vec2(c, 15-c/16) / 16. ), dFdx(p/16.),dFdy(p/16.) );
}

float printNumber(vec2 fragCoord, float number) {
	float fontSize = 72.;
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
	vec2 p = fragCoord.xy / vUv.y;
	float result;
	// output number
	for(int i = 0; i < c; i++) {
		result += char(p * 256. / fontSize + vec2(-.5 * float(i), 0.0), digits[a[i]]).x;
	}
	return result;
}


void main() {
	//float time = iGlobalTime * (1.0 + uAudioFrequency * 20.0);
	float time = iGlobalTime;
	vec3 color;
	vec3 mainColor = vec3(0.1, 0.4, 0.9);

	mainColor.r *= 0.9 + sin(time) / 3.2;
	mainColor.g *= 1.1 + cos(time / 2.0) / 2.5;
	mainColor.b *= 0.8 + cos(time / 5.0) / 4.0;

	mainColor.rgb += 1.0;

		Color[4] colors = Color[](
		Color(vec3(1), 0.0),
		Color(vec3(1), 0.01),
		Color(mainColor, 0.1),
		Color(vec3(0.1, 0.05, 0.2), 1.0)
	);
	
	vec3 light = normalize(vec3(3., 2., -1.));
    float r = dot(nor(vUv), light);

	COLOR_RAMP(colors, 1.0 - r, color);
    
    // Debug:
    vec2 uv = -1.0 + 2.0 *vUv;
    color = mix(color, BLUE, printNumber(uv, .044)); 

	gl_FragColor = vec4(color ,1);
}