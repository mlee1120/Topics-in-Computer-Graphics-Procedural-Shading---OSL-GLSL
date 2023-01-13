#version 150

//
// Bump vertex shader GLSL part 2 for Lab 4.
//
// @author  RIT CS Department
// @author  Michael Lee
//

// INCOMING DATA

// Data from the application

// Vertex position (in model space)
in vec4 vPosition;

// Normal vector at vertex (in model space)
in vec3 vNormal;

//
// Uniform data
//

// Camera and projection matrices
uniform mat4 viewMat;  // view (camera)
uniform mat4 projMat;  // projection

uniform mat4 modelMat; // composite

// Light position is given in world space
uniform vec4 lightPosition;

// OUTGOING DATA

// Vectors to "attach" to vertex and get sent to fragment shader
// Vectors and points will be passed in "eye" space
out vec3 lPos;
out vec3 vPos;
out vec3 vNorm;

// vertex position
out vec3 pos;

// ADD ANY OUTGOING VARIABLES YOU NEED HERE
// tile and mortar colors (ml3406)
out vec4 tileColor1x1;
out vec4 tileColor1x2;
out vec4 tileColor2x1;
out vec4 tileColor4x4;
out vec4 mortarColor;

// tangent and bitangent vectors (ml3406)
out vec3 vTan;
out vec3 vBitan;

//
// Calculate a tangent vector, given a surface normal
//
vec3 calculateTangent( vec3 normal )
{
    vec3 tangent;
    vec3 c1 = cross(normal, vec3(0.0, 0.0, 1.0)); 
    vec3 c2 = cross(normal, vec3(0.0, 1.0, 0.0)); 
    
    if( length(c1) > length(c2) ) {
        tangent = c1;    
    } else {
        tangent = c2;    
    }
    
    tangent = normalize(tangent);

    return tangent;
}

void main()
{
    // create the modelview matrix
    mat4 modelViewMat = viewMat * modelMat;

    // All vectors need to be converted to "eye" space
    // All vectors should also be normalized
    vec4 vertexInEye = modelViewMat * vPosition;
    vec4 lightInEye = viewMat * lightPosition;

    // "Correct" way to transform normals.  The normal matrix is the
    // inverse transpose of the upper left 3x3 submatrix of the modelView
    // matrix (i.e., does not include translations).  THIS IS EXPENSIVE
    // TO COMPUTE because of the inverse(), and should really be done in
    // the application, not here.
    mat3 normMat = inverse( transpose( mat3(modelViewMat) ) );
    vec4 normalInEye = vec4( normMat * vNormal, 0.0 );

    // pass our vertex data to the fragment shader
    lPos = lightInEye.xyz;
    vPos = vertexInEye.xyz;
    vNorm = normalInEye.xyz;

    // send the vertex position into clip space
    gl_Position =  projMat * modelViewMat * vPosition;

    // send the original on as well
    pos = vPosition.xyz;

    // set tile and mortar colors (ml3406)
    tileColor1x1 = vec4(0.5, 0.58, 0.6, 1.0);
    tileColor1x2 = vec4(0.41, 0.61, 0.64, 1.0);
    tileColor2x1 = vec4(0.45, 0.69, 0.65, 1.0);
    tileColor4x4 = vec4(0.54, 0.51, 0.42, 1.0);
    mortarColor = vec4(0.3, 0.3, 0.3, 1.0);
    
    // calculate tangent and bitangent vectors (ml3406)
    vTan = calculateTangent(vNorm);
    vBitan = normalize(cross(vNorm, vTan));
}
