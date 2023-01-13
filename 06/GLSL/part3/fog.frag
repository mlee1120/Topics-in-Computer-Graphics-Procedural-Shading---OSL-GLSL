#version 150

//
// Fog fragment shader for Lab 6 part 3.
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

// 
// I use the noise functions from lab 4 as my density function and modify the range of the density (ml3406)
// Noise functions based on code from Patricio Gonzalo Vivo
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//
vec4  mod289( vec4 x )  { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4  perm( vec4 x )    { return mod289(((x * 34.0) + 1.0) * x); }

// a function that returns the density of the fog at the current position (ml3406)
float current_density(vec3 pos) {
    // modify x coordinates to make fog speard out horizontally (ml3406)
    pos.x *= 0.5;
    vec3 a = floor(pos);
    vec3 d = pos - a;
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
    
    float result = o4.y * d.y + o4.x * (1.0 - d.y);
    
    // modify the range of density from 0.0 ~ 1.0 to min ~ max (ml3406)
    // I know I should not let the range exceed 1.0, but the result looks better if I do so. (ml3406)
    float max = 1.8;
    float min = 0.0;
    result = min + result * (max - min);
    
    return result;
}

// a function that returns the color of the fog at the current position (ml3406)
vec4 current_color(vec3 pos) {
    vec3 a = floor(pos);
    vec3 d = pos - a;
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
    
    // make color range from 0.0 to 0.5 (ml3406)
    float result = o4.y * d.y + o4.x * (1.0 - d.y);
    float max = 0.5;
    float min = 0.0;
    result = min + result * (max - min);

    return vec4(result, result, result, 1.0);
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
    float stepSize = 0.3;

    // the distance from the camera to the intersection point (ml3406)
    float len = length(I);

    // current sampling point - start from the camera position (ml3406)
    vec3 Pcur = vPos - I;

    // color of the volumetric effect (ml3406)
    vec4 Cvol = vec4(0.0);

    // opacity of the effect (ml3406)
    float Ovol = 0.0;
    
    // frequencies of the noise (color and density of the fog) (ml3406)
    float frequency_color = 9.0;
    float frequency_density = 8.1;

    // ray marching algorithm (ml3406)
    while (len > 0) {
        Cvol += (1.0 - Ovol) * stepSize / length(I) * current_color(Pcur * frequency_color);
        Ovol += (1.0 - Ovol) * stepSize / length(I) * current_density(Pcur * frequency_density);    
        Pcur += stepSize * normalize(I);
        len -= stepSize;
    }

    // calculate final color (ml3406)
    color = color * (1 - Ovol) + Cvol * Ovol;

    fragColor = color;
}
