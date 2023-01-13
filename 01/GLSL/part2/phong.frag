//
// Fragment shader (GLSL) for Strauss model from lab 1 part 2 from CSCI 719
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
    vec3 H = normalize(reflect(-L, N));
    vec3 V = normalize(-vPos);

    // angles
    float alpha = acos(dot(N, L));
    float gamma = acos(dot(N, V));
    
    // scalars and functions
    // smoothness
    float s = 0.5;
    // metalness
    float m = 0.5;
    // transparency
    float t = 0.0;
    // specular exponent
    float h = 3.0 / (1.0 - s);
    // diffuse reflectivity multiplier
    float d = 1.0 - m * s;
    // diffuse reflectivity
    float rd = (1.0 - pow(s, 3)) * (1 - t);    
    // Fresnel approximation constant
    float kf = 1.12;
    // geometric attenuation approximation constant
    float kg = 1.01;
    // PI
    float pi = 3.14159265359;
    // Fresnel reflectance approximation
    float F_alpha = (1.0 / pow((alpha / pi / 2.0 - kf), 2) - 1.0 / pow(kf, 2)) / (1.0 / pow((1.0 - kf), 2) - 1.0 / pow(kf, 2));
    // Geometric attenuation approximation
    float G_alpha = (1.0 / pow((1.0 - kg), 2) - 1.0 / pow(alpha / pi / 2.0 - kg, 2)) / (1.0 / pow((1.0 - kg), 2) - 1.0 / pow(kg, 2));
    float G_gamma = (1.0 / pow((1.0 - kg), 2) - 1.0 / pow(gamma / pi / 2.0 - kg, 2)) / (1.0 / pow((1.0 - kg), 2) - 1.0 / pow(kg, 2));
    // specular reflectivity adjustment
    float j = F_alpha * G_alpha * G_gamma;
    // specular reflectivity adjustment constant   
    float kj = 0.1;
    // specular reflectivity at normal incidence
    float rn = (1.0 - t) - rd;
    // adjusted specular reflectivity
    float rj = min(1.0, (rn + (rn + kj) * j));
    // specular reflectivity  
    float rs = pow(dot(H, V), h) * rj;

    // calculate components
    vec4 Qd = dot(N, L) * d * rd * diffuseColor;
    vec4 Qs = rs * specularColor;
    vec4 Qa = rd * ambientColor;

    // calculate the final color
    vec4 color = lightColor * (Qd + Qs) + ambientLight * Qa;

    fragColor = color;
}
