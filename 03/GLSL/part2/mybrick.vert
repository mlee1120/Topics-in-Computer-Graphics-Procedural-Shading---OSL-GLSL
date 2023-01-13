#version 150

//
// Brick shader for Lab 3
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

// Texture coordinate for this vertex
in vec2 vTexCoord;

// Transformations
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

// ADD ANY OUTGOING VARIABLES YOU NEED HERE

// texture coordinate to be sent to the fragment shader
out vec2 texCoord;

// basic brick color
out vec4 brickColor;

// mortar color (ml3406)
out vec4 mortarColor;

void main()
{
    // create the model and modelview matrices
    // transformation order: scale, rotate Z, rotate Y, rotate X, translate
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

    // set the brick color (must be changed)
    brickColor = vec4( 0.6, 0.15, 0.1, 1.0 );
    
    // set the mortar color (ml3406)
    mortarColor = vec4( 0.75, 0.75, 0.75, 1.0 );

    // pass the texture coordinates
    texCoord = vTexCoord;

    // send the vertex position into clip space
    gl_Position =  projMat * modelViewMat * vPosition;
}
