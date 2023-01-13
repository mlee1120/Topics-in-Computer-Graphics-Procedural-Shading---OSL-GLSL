//  
//  Lab 5 part 1
//
//  Application.cpp
//
//  Assignment-specific code for this assignment.
//
//  Created by Warren R. Carithers on 2019/09/09.
//  Based on earlier versions created by Joe Geigel and Warren R. Carithers
//  Copyright 2019 Rochester Institute of Technology. All rights reserved.
//
//  This file should not be modified by students.
//  @contributor  RIT CS Department
//  @contributor  Michael Lee (ml3406)
//

#include <cstdlib>
#include <iostream>

#if defined(_WIN32) || defined(_WIN64)
#include <windows.h>
#endif

//
// GLEW and GLFW header files also pull in the OpenGL definitions
//

#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include <glm/vec2.hpp>
#include <glm/vec3.hpp>

#include "Application.h"

#include "ShaderSetup.h"
#include "Types.h"
#include "Utils.h"

// need this because we aren't using BufferSets
#define BUFFER_OFFSET(i)        ((GLvoid *)(((char *)0) + (i)))


using namespace std;

//
// PRIVATE GLOBALS
//

//
// Object information
//

// "point" structure:  location, color, expansion factor, and radius
typedef struct pt_s {
    GLfloat x; GLfloat y; GLfloat z; GLfloat w;
    GLfloat r; GLfloat g; GLfloat b; GLfloat a;
    GLfloat factor;
    GLfloat radius;
} MyPoint;

// one point!
static MyPoint points[] = {
    { 0.00f,  0.00f,  0.00f,  1.00f,   // center of the window
      1.00f,  1.00f,  0.00f,  1.00f,   // yellow
     10.00f,  0.25f }                  // 10x10 expansion, radius 0.25
};

// # = total size divided by size of each entry
static const int n_points = sizeof(points) / sizeof(MyPoint);

// size = total size / number of points
static const int s_point = sizeof(MyPoint);

// We need a vertex buffer for our shape
GLuint bnum;

// shader program handle
static GLuint program;

// our VAO
static GLuint vao;

// names of our GLSL shader files
static const char *vshader = "shader.vert";
static const char *gshader = "shader.geom";
static const char *fshader = "shader.frag";

//
// PUBLIC GLOBALS
//

//
// Drawing-related variables
//

// dimensions of the drawing window
int w_width  = 600;
int w_height = 600;

// drawing window title
const char *w_title = (char *) "Lab 5";

// GL context we're using (we assume 3.2, for GLSL 1.50)
int gl_maj = 3;
int gl_min = 2;

// our GLFWwindow
GLFWwindow *w_window;

//
// PRIVATE FUNCTIONS
//

///
/// process the command-line arguments
///
/// @param argc   number of command-line arguments
/// @param argv   command-line argument strings
///
static void args( const int argc, char *argv[] ) {
    // nothing to do for this assignment!
    (void) argc;
    (void) argv;
}

///
/// createImage() - create vertex and element buffers for our shapes
///
static void createImage( void )
{
    // get a buffer ID
    glGenBuffers( 1, &bnum );
    glBindBuffer( GL_ARRAY_BUFFER, bnum );
    glBufferData( GL_ARRAY_BUFFER, sizeof(points), points, GL_STATIC_DRAW );
}

///
/// Event callback routines for this assignment
///

///
/// Handle keyboard input
///
/// @param window   GLFW window being used
/// @param key      code for the key that was pressed
/// @param scan     scan code of the key
/// @param action   type of event (press, release, etc.)
/// @param mods     modifiers in use (shift, etc.)
///
static void keyboard( GLFWwindow *window, int key, int scan,
                      int action, int mods )
{
    // only react to "press" events
    if( action != GLFW_PRESS ) {
        return;
    }

    switch( key ) {

    // termination
    case GLFW_KEY_ESCAPE:  // FALL THROUGH
    case GLFW_KEY_Q:
        glfwSetWindowShouldClose( window, 1 );
        break;

    // help message
    case GLFW_KEY_H:
        cout << "  Key(s)             Action" << endl;
        cout << "=========   =======================" << endl;
        cout << "ESC, q, Q   Terminate the program" << endl;
        cout << "  h, H      Print this message" << endl;
        break;

    default:
        cerr << "Unknown keycode " << key << " ignored" << endl;
    }
}

///
/// Display the current image
///
static void display( void )
{
    // clear the frame buffer
    glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

    // ensure we have selected the shader program
    glUseProgram( program );

    // set our titlebar (not needed for this assignment)
    // setTitle();

    // check for any errors to this point
    checkErrors( "display init" );

    // not doing any transformations this time around
    // setProjection( program );
    // checkErrors( "display projection" );
    // setLighting( program );
    // checkErrors( "display cube lighting" );
    // setCamera( program );
    // checkErrors( "display camera" );

    // pass in the attributes
    // stride here is 10 * sizeof(GLfloat), as there are
    // four vertex coords, four color values, one "factor" value,
    // and one "radius" value

    GLint loc = getAttribLoc( program, "vPosition" );
    glEnableVertexAttribArray( loc );
    glVertexAttribPointer( loc, 4, GL_FLOAT, GL_FALSE, s_point,
            BUFFER_OFFSET( 0 ) );

    loc = getAttribLoc( program, "vColor" );
    glEnableVertexAttribArray( loc );
    glVertexAttribPointer( loc, 4, GL_FLOAT, GL_FALSE, s_point,
            BUFFER_OFFSET( 4 * sizeof(GLfloat) ) );


    // These are commented out for now to prevent OpenGL error
    // messages because the GLSL compiler will optimize out
    // unused variables

    // REMOVE the #if and #endif when you begin to use them in
    // your geometry shader

    loc = getAttribLoc( program, "vFactor" );
    glEnableVertexAttribArray( loc );
    glVertexAttribPointer( loc, 1, GL_FLOAT, GL_FALSE, s_point,
            BUFFER_OFFSET( 8 * sizeof(GLfloat) ) );

    loc = getAttribLoc( program, "vRadius" );
    glEnableVertexAttribArray( loc );
    glVertexAttribPointer( loc, 1, GL_FLOAT, GL_FALSE, s_point,
            BUFFER_OFFSET( 9 * sizeof(GLfloat) ) );

    checkErrors( "display obj setup" );

    glDrawArrays( GL_POINTS, 0, n_points );

    checkErrors( "display obj draw" );
}

///
/// OpenGL initialization
///
/// @return boolean indicating status of initialization
///
static bool init( void )
{
    // Check the OpenGL version - we need at least OpenGL 3.2
    // in order to get GLSL 1.50
    if( gl_maj < 3 || (gl_maj == 3 && gl_min < 2) ) {
        cerr << "Cannot use GLSL 1.50 - shaders won't compile!" << endl
             << "Bailing out!" << endl;
        return( false );
    }

    // Load shaders and use the resulting shader program
    ShaderError error;
    program = shaderSetup( vshader, fshader, gshader, &error );
    if( !program ) {
        cerr << "Error setting up shaders - "
             << errorString(error) << endl;
        return( false );
    }

#if defined(DEBUG)
    // this code can be enabled if you need to dump out the
    // shader variables for the shader

    cout << "Shader actives" << endl;
    cout << "----------" << endl << "Shader ID " << program << endl;
    dumpActives( program );
#endif

    glUseProgram( program );

    checkErrors( "init program" );

    // need a VAO if we're using a core context;
    // doesn't hurt even if we're not using one
    glGenVertexArrays( 1, &vao );
    glBindVertexArray( vao );
    checkErrors( "init vao" );

    // OpenGL state initialization
    // NOT DOING CULLING
    // glEnable( GL_DEPTH_TEST );
    // glEnable( GL_CULL_FACE );
    // glCullFace( GL_BACK );
    // glDepthFunc( GL_LEQUAL );
    // glClearDepth( 1.0f );
    glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
    glClearColor( 0.0f, 0.0f, 0.0f, 0.0f );
    checkErrors( "init setup" );

    // Create all our objects
    createImage();
    checkErrors( "init image" );

    // register our callbacks
    glfwSetKeyCallback( w_window, keyboard );
    checkErrors( "init callback" );

    return( true );
}

///
/// PUBLIC FUNCTIONS
///

///
/// Assignment-specific processing
///
void application( int argc, char *argv[] )
{
    // process command-line arguments
    args( argc, argv );
    
    // set up the objects and the scene
    if( !init() ) {
        return;
    }
    checkErrors( "after init" );

    // loop until it's time to quit
    while( !glfwWindowShouldClose(w_window) ) {
        display();
        glfwSwapBuffers( w_window );
        checkErrors( "event loop" );
        glfwWaitEvents();
    }
}
