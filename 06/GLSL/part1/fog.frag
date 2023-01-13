#version 150

//
// Fog fragment shader for Lab 6 part 1.
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

    // add in the fog effect here
    // THIS CODE WILL NEED TO BE SIGNIFICANTLY CHANGED!!!
    
    // calculate the effect of the uniform fog => C_increase (ml3406)
    vec4 effect = fogColor * density;
    
    // final color = color partially blocked by the fog C_leave = C_enter - C_reduce + C_increase (ml3406)
    fragColor = color * (1 - density) + effect;
}
