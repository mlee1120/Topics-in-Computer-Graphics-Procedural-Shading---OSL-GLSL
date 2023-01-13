//
// Fragment shader (GLSL) from lab 1 part 1 from CSCI 719
//
// Created by Warren R. Carithers.
//
// Contributor: Michael Lee (ml3406)
//

#version 150

// Phong shading fragment shader
//
// Uses shading information provided by the vertex shader
// to do Phong shading calculations.

// INCOMING DATA

// Light color
uniform vec4 lightColor;
uniform vec4 ambientLight;

// Material properties
uniform vec4 diffuseColor;
uniform vec4 ambientColor;
uniform vec4 specularColor;
uniform float specExp;
uniform vec3 kCoeff;

// Vectors "attached" to vertex by vertex shader and interpolated

// Light position
in vec3 lPos;

// Vertex position (in clip space)
in vec3 vPos;

// Vertex normal
in vec3 vNorm;

// OUTGOING DATA
out vec4 fragColor;

void main()
{
    // calculate lighting vectors
    vec3 L = normalize(lPos - vPos);
    vec3 N = normalize(vNorm);
    vec3 R = normalize(reflect(-L, N));
    vec3 V = normalize(-(vPos));

    // calculate components
    
    // change ambient color (ml3406)
    vec4 colorChange = ambientColor.gbra; 
    vec4 ambient = colorChange * ambientLight;
    
    // ambient component is modified according to the distance between the light source and the vertex (ml3406)
    vec3 distance = lPos - vPos;
    ambient = ambient * pow(sqrt(distance[0] * distance[0] + distance[1] * distance[1] + distance[2] * distance[2]), 3) / 75;
    
    // change diffuse color (ml3406)
    colorChange = diffuseColor.gbra; 
    vec4 diffuse = lightColor * colorChange * max(dot(N,L),0.0);
    
    // make specular dot bigger (ml3406)
    float specDot = pow( max(dot(R,V),0.0), specExp / 3.0);
    
    // change specular color (ml3406)
    colorChange = specularColor.gbra; 
    vec4 specular = lightColor * colorChange * specDot;

    // calculate the final color
    vec4 color = (kCoeff.x * ambient) +
                 (kCoeff.y * diffuse) +
                 (kCoeff.z * specular);

    fragColor = color;
}
