
varying vec2 vUv;
uniform float progress;
uniform sampler2D texture2;
// cmarangu has linked all 7 segments in his comments
// https://www.shadertoy.com/view/3dtSRj

bool showOff = true;
vec4 FragColor;

float segment(vec2 uv, bool On)
{
	if (!On && !showOff)
		return 0.0;
	
	float seg = (1.0-smoothstep(0.08,0.09+float(On)*0.02,abs(uv.x)))*
			    (1.0-smoothstep(0.46,0.47+float(On)*0.02,abs(uv.y)+abs(uv.x)));
	
    //Fiddle with lights and matrix
	//uv.x += sin(iTime*60.0*6.26)/14.0;
	//uv.y += cos(iTime*60.0*6.26)/14.0;
	
	//led like brightness
	if (On)
		seg *= (1.0-length(uv*vec2(0.2,0.1)));//-sin(iTime*25.0*6.26)*0.04;
	else
			seg *= -(0.05+length(uv*vec2(0.2,0.1)));

	return seg;
}

float sevenSegment(vec2 uv,int num)
{
	float seg= 0.0;
    seg += segment(uv.yx+vec2(-1.0, 0.0),num!=-1 && num!=1 && num!=4                    );
	seg += segment(uv.xy+vec2(-0.5,-0.5),num!=-1 && num!=1 && num!=2 && num!=3 && num!=7);
	seg += segment(uv.xy+vec2( 0.5,-0.5),num!=-1 && num!=5 && num!=6                    );
   	seg += segment(uv.yx+vec2( 0.0, 0.0),num!=-1 && num!=0 && num!=1 && num!=7          );
	seg += segment(uv.xy+vec2(-0.5, 0.5),num==0 || num==2 || num==6 || num==8           );
	seg += segment(uv.xy+vec2( 0.5, 0.5),num!=-1 && num!=2                              );
    seg += segment(uv.yx+vec2( 1.0, 0.0),num!=-1 && num!=1 && num!=4 && num!=7          );
	
	return seg;
}

float showNum(vec2 uv,int nr, bool zeroTrim)
{
	//Speed optimization, leave if pixel is not in segment
	if (abs(uv.x)>1.5 || abs(uv.y)>1.2)
		return 0.0;
	
	float seg= 0.0;
	if (uv.x>0.0)
	{
		nr /= 10;
		if (nr==0 && zeroTrim)
			nr = -1;
		seg += sevenSegment(uv+vec2(-0.75,0.0),nr);
        FragColor = vec4(seg , -seg * .9, -seg * .9,1.);
	}
	else {
        seg += sevenSegment(uv+vec2( 0.75,0.0),int(mod(float(nr),10.0)));
        FragColor = vec4(seg , -seg * .9, -seg * .9,1.);
    }
	
	return seg;
}

void main()
{
    gl_FragColor = FragColor;
		vec2 p = vUv*2.0-1.0;
		vec2 uv = vUv;

		uv *= 7.0; // size
	
	uv.x *= -1.0;
	uv.x += uv.y/12.0;
		
		// position
    uv.x += 3.9; 
		uv.y -= 3.0;
	float seg = 0.0;

	float timeSecs = progress;
	
	seg += showNum(uv,int(mod(timeSecs,100.0)),false);
	
	timeSecs = floor(timeSecs/100.0);
	
    uv.x -= 1.75;
    uv.x -= 1.25;
	
	seg += showNum(uv,int(mod(timeSecs,10.0)),true);
    
     vec2 newVec = vUv;
     vec3 txt = texture2D(texture2, newVec).xyz;
     
     gl_FragColor = FragColor;
     gl_FragColor += vec4(txt,1.);
     
}