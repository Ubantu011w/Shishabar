uniform float progress;
uniform float iGlobalTime;

varying vec2 vUv;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 0.0, 0.0, 1.0);
    return K.xyz;
}


void main()
{
    //vec2 uv = -1.0 + 2.0 *vUv;
	vec2 border = vec2(0.00, 0.0);
    vec3 col = 0.5 + 0.5*cos(iGlobalTime+vUv.xyx+vec3(0,2,4));
    col.x = 0.0;
    vec4 backCol = vec4(col, 1.0);
    
    // generate border mask
	vec2 mask2 = step(border, vUv) * step(vUv, 1.0-border);
    float mask = mask2.x*mask2.y;
    float newProgress = progress / 1000.;
    float blend = ((vUv.y - newProgress) <= 0.0 ? 1.0 : 0.0) * mask;
    vec4 foreCol = vec4(hsv2rgb(vec3(newProgress*0.33333 - 0.1, 1.0, 1.0)), 1.0);
    gl_FragColor = foreCol*blend + backCol*(1.0-blend);
}