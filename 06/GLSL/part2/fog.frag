#version 150

//
// Fog fragment shader for Lab 6 part 2.
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
uniform vec4 baseColor;
uniform float specExp;
uniform float kCoeff;

// Fog parameters
uniform vec4 fogColor;
uniform float density;

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

// OUTGOING DATA

// The final fragment color
out vec4 fragColor;

// a function that returns uniform density of fog (ml3406)
float current_density(vec3 pos) {
    return density;
}

// a function that returns uniform color of fog (ml3406)
vec4 current_color(vec3 pos) {
    return fogColor;
}

void main()
{
    // calculate lighting vectors
    vec3 L = normalize( lPos - vPos );
    vec3 N = normalize( vNorm );
    vec3 R = normalize( reflect(-L, N) );
    vec3 V = normalize( -(vPos) );

    // Phong shading
    vec4 ambient  = ambientLight * baseColor;
    vec4 diffuse  = lightColor * baseColor * max(dot(N,L),0.0);
    float specDot = pow( max(dot(R,V),0.0), specExp );
    vec4 specular = lightColor * baseColor * specDot;

    // calculate the final color
    vec4 color = (kCoeff * ambient) +
                 (kCoeff * diffuse) +
                 (kCoeff * specular);

    // add in the fog effect here-
    // THIS CODE WILL NEED TO BE SIGNIFICANTLY CHANGED!!!

    // direction (vector) from the camera to the intersection point (ml3406)
    vec3 I = vPos;

    // step size for ray marching (ml3406)
    float stepSize = 0.01;

    // the distance from the camera to the intersection point (ml3406)
    float len = length(I);

    // current sampling point - start from the camera position (ml3406)
    vec3 Pcur = vPos - I;

    // color of the volumetric effect (ml3406)
    vec4 Cvol = vec4(0.0);

    // opacity of the effect (ml3406)
    float Ovol = 0.0;
    
    // ray marching algorithm (ml3406)
    while (len > 0) {
        Cvol += (1.0 - Ovol) * stepSize / length(I) * current_color(pos);
        Ovol += (1.0 - Ovol) * stepSize / length(I) * current_density(pos);    
        Pcur += stepSize * normalize(I);
        len -= stepSize;
    }

    // calculate final color (ml3406)
    color = color * (1 - Ovol) + Cvol * Ovol;

    fragColor = color;
}
