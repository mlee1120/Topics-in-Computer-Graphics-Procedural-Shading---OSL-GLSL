#version 150

// Texture shading fragment shader
//
// Uses shading information provided by the vertex shader
// to do Phong shading calculations.
//
// @author  RIT CS Department
// @author  Michael Lee

// INCOMING DATA

// Data from the application

// Light color
uniform vec4 lightColor;
uniform vec4 ambientLight;

// Reflectivity
uniform float specExp;
uniform vec3 kCoeff;

// Textures
uniform sampler2D material;

// texture bump (ml3406)
uniform sampler2D bump;  

// Data from the vertex shader

// Light position
in vec3 lPos;

// Vertex position (in clip space)
in vec3 vPos;

// Vertex normal
in vec3 vNorm;

// Texture coordinates
in vec2 texCoord;

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

    // get the color data from the texture image
    vec4 matColor = texture( material, texCoord );
    
    // get the color data from the texture bump image (ml3406)
    vec4 matColorBump = texture(bump, texCoord);

    // transparency (ml3406)
    float alpha = 1.0;
    
    // use specExp values to tell which object we are handling (ml3406)
    // cube => opacity = 0 if black; opacity = 1 if white (ml3406)
    if(specExp == 50.0){
        if (matColor.r > 0.5) alpha = 1.0;
        else alpha = 0.0;
    } 

    // cylinder => opacity = value of the red channel (ml3406)
    else if (specExp == 20.0) {
        alpha = matColor.r;
        //alpha = matColor.g;
        //alpha = matColor.b;
    }

    // sphere => opacity = value of the texture bump value (ml3406)
    else {
        alpha = matColorBump.r;
    }

    // calculate components
    vec4 ambient = matColor * ambientLight;
    vec4 diffuse = matColor * lightColor * max(dot(N,L),0.0);
    float specDot = pow( max(dot(R,V),0.0), specExp );
    vec4 specular = matColor * lightColor * specDot;


    // calculate the final color
    vec4 color = (kCoeff.x * ambient) +
                 (kCoeff.y * diffuse) +
                 (kCoeff.z * specular);

    // change opacity (ml3406)
    color.a = alpha;        
    fragColor = color;
}
