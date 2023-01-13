#version 150

//
// Bump fragment shader GLSL part 1 for Lab 4.
//
// @author  RIT CS Department
// @author  Michael Lee
//

// INCOMING DATA

// Data from the application

// Light color
uniform vec4 lightColor;
uniform vec4 ambientLight;

// Material properties
uniform float specExp;
uniform vec3 kCoeff;

// Data from the vertex shader

// Light position
in vec3 lPos;

// Vertex position (in clip space)
in vec3 vPos;

// Vertex normal
in vec3 vNorm;

// Original vertex position (sort of)
in vec3 pos;

// ADD ANY OTHER INCOMING VARIABLES (FROM THE APPLICATION
// OR FROM THE VERTEX SHADER) HERE

// define parameters for tiles (ml3406)
#define MORTARTHICKNESS   0.015
#define TILESIZE          (1.0 - 6 * MORTARTHICKNESS) / 5.0
#define BLOCKSIZE         (TILESIZE + MORTARTHICKNESS)

// tile and mortar colors (ml3406)
in vec4 tileColor1x1;
in vec4 tileColor1x2;
in vec4 tileColor2x1;
in vec4 tileColor4x4;
in vec4 mortarColor;

// OUTGOING DATA

// The final fragment color
out vec4 fragColor;

//
// Noise functions based on code from Patricio Gonzalo Vivo
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//
float rand( float n ) { return fract(sin(n) * 43758.5453123); }

float noise( float p ) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float rand( vec2 n ) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float mod289( float x ) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4  mod289( vec4 x )  { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4  perm( vec4 x )    { return mod289(((x * 34.0) + 1.0) * x); }

float noise( vec3 p ) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

// simple noise3() replacement
vec3 noise3( vec3 p ) {
    return vec3(noise(p.x),noise(p.y),noise(p.z));
}

void main()
{   
    // calculate st coordinates (ml3406)
    float s = (pos.x - (-0.5)) / (0.5 - (-0.5));
    float t = (pos.y - (-0.5)) / (0.5 - (-0.5));

    // see where we are in the block (ml3406)
    float sb = mod(s, BLOCKSIZE);
    float tb = mod(t, BLOCKSIZE);

    // basic object color
    vec3 c = noise3( pos );
    vec4 basicColor = vec4( c, 1.0 );  // noise4(pos)

    // calculate lighting vectors
    vec3 L = normalize( lPos - vPos );
    vec3 N = normalize( vNorm );
    vec3 R = normalize( reflect(-L, N) );
    vec3 V = normalize( -(vPos) );

    vec4 ambient  = vec4(0.0);  // ambient color component
    vec4 diffuse  = vec4(0.0);  // diffuse color component
    vec4 specular = vec4(0.0);  // specular color component
    float specDot;  // specular dot(R,V) ^ specExp value

    // an auxiliary variable for choosing which color to use (make it more readable) (ml3406)
    vec4 colorTemp;

    // see which row and column the tile or the mortar is (ml3406) 
    float row = floor(t / BLOCKSIZE);
    float column = floor(s / BLOCKSIZE);

    // mortar (ml3406)
    if(sb < MORTARTHICKNESS || tb < MORTARTHICKNESS) {
    	// 1x2 (ml3406)
        if ((row == 2 && column == 1 && tb > MORTARTHICKNESS) || (row == 4 && column == 2 && tb > MORTARTHICKNESS) || (row == 0 && column == 4 && tb > MORTARTHICKNESS)) colorTemp = tileColor1x2;
        // 2x1 (ml3406)
        else if((row == 1 && column == 0 && sb > MORTARTHICKNESS) || (row == 4 && column == 0 && sb > MORTARTHICKNESS) || (row == 3 && column == 2 && sb > MORTARTHICKNESS) || (row == 2 && column == 4 && sb > MORTARTHICKNESS)) colorTemp = tileColor2x1;
        // 4x4 (ml3406)
        else if((row == 0 && column == 2 && tb > MORTARTHICKNESS) || (row == 1 && column == 1 && sb > MORTARTHICKNESS) || (row == 1 && column == 2) || (row == 3 && column == 4 && tb > MORTARTHICKNESS) || (row == 4 && column == 3 && sb > MORTARTHICKNESS) || (row == 4 && column == 4)) colorTemp = tileColor4x4;
        // mortar (ml3406)
        else colorTemp = mortarColor;
    } 
    // tiles (ml3406)
    else {   
        // 1x1 (ml3406)
        if((row == 3 && column == 1) || (row == 1 && column == 3) || (row == 2 && column == 3)) colorTemp = tileColor1x1;
        // 1x2 (ml3406)
        else if((row == 0 && column == 3) || (row == 0 && column == 4) || (row == 2 && column == 0) || (row == 2 && column == 1) || (row == 4 && column == 1) || (row == 4 && column == 2)) colorTemp = tileColor1x2;
        // 2x1 (ml3406)
        else if((row == 0 && column == 0) || (row == 1 && column == 0) || (row == 1 && column == 4) || (row == 2 && column == 2) || (row == 2 && column == 4) || (row == 3 && column == 0) || (row == 3 && column == 2) || (row == 4 && column == 0)) colorTemp = tileColor2x1;
        // 4x4 (ml3406)
        else colorTemp = tileColor4x4;
    }
    
    // calculate color components (ml3406)
    ambient  = ambientLight * colorTemp;
    diffuse  = lightColor * colorTemp * max(dot(N,L),0.0);
    specDot  = pow( max(dot(R,V),0.0), specExp );
    specular = lightColor * colorTemp * specDot;

    // calculate the final color
    vec4 color = (kCoeff.x * ambient) +
                 (kCoeff.y * diffuse) +
                 (kCoeff.z * specular);

    fragColor = color;
}
