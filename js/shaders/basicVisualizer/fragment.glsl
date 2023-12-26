varying vec2 vUv;

uniform float iGlobalTime;
uniform float uAudioFrequency;
uniform sampler2D spectrum;
uniform sampler2D texture1;

#define GREEN vec3(.3,1.,.3)
#define BLUE vec3(.3,0.,1.)

//Debug
//From: https://www.shadertoy.com/view/4sBfRd
// vec4 char(vec2 p, int c) {
//     if (p.x<.0|| p.x>1. || p.y<0.|| p.y>1.) return vec4(0,0,0,1e5);
// 	return textureGrad( texture1, p/16. + fract( vec2(c, 15-c/16) / 16. ), dFdx(p/16.),dFdy(p/16.) );
// }

// float printNumber(vec2 fragCoord, float number) {
// 	float fontSize = 72.;
// 	// init digits
// 	int digits[12];
// 	// numbers start at 48 in font map
// 	for(int i = 0; i <= 9; i++) digits[i] = 48 + i;
// 	digits[10] = 46; // .
// 	digits[11] = 45; // -

// 	int a[15]; // array for digits of number
// 	int c = 0; // counter for array = length
// 	float tmp = abs(number);
// 	// do not display numbers higher than this due to precision issues
// 	if (tmp > 999999.) {
// 		while(c < 8) a[c++] = 11; // --------
// 	} else {
// 		if(number < 0.) a[c++] = 11; // add - if number is negative
// 		int v; // current digit
// 		bool f; // true if first digit > 0 found
// 		for(int i = 8; i >= -4; i--) {
// 			v = int(tmp / pow(10., float(i))); // calculate digit
// 			// omit leading zeros
// 			if(v > 0 || f) {
// 				a[c++] = v; // add digits 0-9
// 				tmp -= float(v) * pow(10., float(i)); // subtract
// 				f = true;
// 			}
// 			//decimal point
// 			if(i == 0 && abs(number) < 1.) a[c++] = 0; // add 0
// 			if(i == 0) a[c++] = 10; // add .
// 		}
// 		while(a[c-1] == 0) c--; // strip 0
// 		if(a[c-1] == 10) c--; // strip .
// 	}
// 	// coordinate system that starts at bottom left
// 	// which is independent of aspect ratio
// 	vec2 p = fragCoord.xy / vUv.y;
// 	float result;
// 	// output number
// 	for(int i = 0; i < c; i++) {
// 		result += char(p * 256. / fontSize + vec2(-.5 * float(i), 0.0), digits[a[i]]).x;
// 	}
// 	return result;
// }

float noise3D(vec3 p)
{
	return fract(sin(dot(p ,vec3(12.9898,78.233,12.7378))) * 43758.5453)*2.0-1.0;
}

vec3 mixc(vec3 col1, vec3 col2, float v)
{
    v = clamp(v,0.0,1.0);
    return col1+v*(col2-col1);
}

void main()
{
    vec2 p = vUv*2.0-1.0;
    //p.x*=iResolution.x/iResolution.y; ratio
    p.y+=0.5;
    
    vec3 col = vec3(0.0);
    vec3 ref = vec3(0.0);
   
    float nBands = 64.0;
    float i = floor(vUv.x*nBands);
    float f = fract(vUv.x*nBands);
    float band = i/nBands;
    band *= band*band;
    band = band*0.995;
    band += 0.005;
    //float s = texture2D(spectrum, vec2(band,0.25)).x;
    float s = uAudioFrequency * band;
    
    /* Gradient colors and amount here */
    const int nColors = 4;
    vec3 colors[nColors];  
    colors[0] = vec3(0.0,0.0,1.0);
    colors[1] = vec3(0.0,1.0,1.0);
    colors[2] = vec3(1.0,1.0,0.0);
    colors[3] = vec3(1.0,0.0,0.0);
    
    vec3 gradCol = colors[0];
    float n = float(nColors)-1.0;
    for(int i = 1; i < nColors; i++)
    {
		gradCol = mixc(gradCol,colors[i],(s-float(i-1)/n)*n);
    }
      
    col += vec3(1.0-smoothstep(0.0,0.01,p.y-s*1.5));
    col *= gradCol;

    ref += vec3(1.0-smoothstep(0.0,-0.01,p.y+s*1.5));
    ref*= gradCol*smoothstep(-0.5,0.5,p.y);
    
    col = mix(ref,col,smoothstep(-0.01,0.01,p.y));

    col *= smoothstep(0.125,0.375,f);
    col *= smoothstep(0.875,0.625,f);

    col = clamp(col, 0.0, 1.0);

    float dither = noise3D(vec3(p,iGlobalTime))*2.0/256.0;
    col += dither;

    // vec2 uv = -1.0 + 2.0 *vUv;
    // col = mix(col, BLUE, printNumber(uv, s)); 
    
	gl_FragColor = vec4(col,1.0);
}