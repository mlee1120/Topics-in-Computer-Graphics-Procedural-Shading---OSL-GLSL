#version 150

//
// Brick fragment shader for Lab 3
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

// Texture coordinates
in vec2 texCoord;

// basic brick color
in vec4 brickColor;

// ADD ANY OTHER INCOMING VARIABLES (FROM THE APPLICATION
// OR FROM THE VERTEX SHADER) HERE

// define parameters for bricks (ml3406)
#define BRICKWIDTH        0.25
#define BRICKHEIGHT       0.08
#define MORTARTHICKNESS   0.01
#define BLOCKHEIGHT   (BRICKHEIGHT + MORTARTHICKNESS)
#define BLOCKWIDTH    (BRICKWIDTH + MORTARTHICKNESS)

// mortar color (ml3406)
in vec4 mortarColor;

// OUTGOING DATA

// The final fragment color
out vec4 fragColor;

// Classic Perlin Noise by Patricio Gonzalez Vivo
// slightly modified by Michael Lee and some parameters have been tuned 
vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.3 - 15.3) + 9.9);
}

vec4 permute(vec4 x) {
    return mod(((x * 171.0) + 81.0) * x, 216.0);
}

float cnoise(vec2 P, float min) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 216.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  
  // tune final value and limit its range to min ~ 1.0 (ml3406)
  n_xy *= 9; 
  n_xy = abs(n_xy);
  if(n_xy > 1) n_xy = 1.0;
  n_xy += (1.0 - n_xy) * min;
  return n_xy;
}

void main()
{
    // calculate lighting vectors
    vec3 L = normalize( lPos - vPos );
    vec3 N = normalize( vNorm );
    vec3 R = normalize( reflect(-L, N) );
    vec3 V = normalize( -(vPos) );

    vec4 ambient  = vec4(0.0);  // ambient color component
    vec4 diffuse  = vec4(0.0);  // diffuse color component
    vec4 specular = vec4(0.0);  // specular color component
    float specDot;  // specular dot(R,V) ^ specExp value

    //
    // The following code implements Phong shading.  It must be
    // modified to perform texture mapping using Phong.
    //
    
    // st values (ml3406)
    float s = texCoord[0];
    float t = texCoord[1];
    
    // If row is even, offset length by a half
    if( mod(ceil(t / BLOCKHEIGHT), 2) == 0 )
        s += (BLOCKWIDTH/2);
        
    // wrap texture coords to see where we are in the block
    float sb = mod(s, BLOCKWIDTH);
    float tb = mod(t, BLOCKHEIGHT);
        
    // determine where we are on the brick 
    float sbrick = floor( sb );
    float tbrick = floor( tb );
    sb -= sbrick;
    tb -= tbrick;
    
    // generate perlin noise (ml3406) 
    float noise = cnoise(vec2(texCoord), 0.63);

    // calculate components based on corresponding colors (ml3406)
    if( sb < MORTARTHICKNESS || tb < MORTARTHICKNESS ) {
    	ambient  = ambientLight * mortarColor;
    	diffuse  = lightColor * mortarColor * max(dot(N,L),0.0);
    	specDot  = pow( max(dot(R,V),0.0), specExp );
    	specular = lightColor * mortarColor * specDot;
    } 
    // add generated noise to the bricks (ml3406)
    else {
    	ambient  = ambientLight * brickColor * noise;
    	diffuse  = lightColor * brickColor * max(dot(N,L),0.0) * noise;
    	specDot  = pow( max(dot(R,V),0.0), specExp );
    	specular = lightColor * brickColor * specDot * noise;
    }

    // calculate the final color
    vec4 color = (kCoeff.x * ambient) +
                 (kCoeff.y * diffuse) +
                 (kCoeff.z * specular);
    
    // output the final color
    fragColor = color;
}