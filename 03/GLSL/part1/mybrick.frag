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
    
    // calculate components based on corresponding colors (ml3406)
    if( sb < MORTARTHICKNESS || tb < MORTARTHICKNESS ) {
    	ambient  = ambientLight * mortarColor;
    	diffuse  = lightColor * mortarColor * max(dot(N,L),0.0);
    	specDot  = pow( max(dot(R,V),0.0), specExp );
    	specular = lightColor * mortarColor * specDot;
    } else {
    	ambient  = ambientLight * brickColor;
    	diffuse  = lightColor * brickColor * max(dot(N,L),0.0);
    	specDot  = pow( max(dot(R,V),0.0), specExp );
    	specular = lightColor * brickColor * specDot;
    }

    // calculate the final color
    vec4 color = (kCoeff.x * ambient) +
                 (kCoeff.y * diffuse) +
                 (kCoeff.z * specular);
    
    // output the final color
    fragColor = color;
}
