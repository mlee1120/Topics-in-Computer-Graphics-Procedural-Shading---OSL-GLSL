//
//  Lighting
//
//  Simple module for setting up the parameters for lighting and shading
//  for the Shading Assignment.
//
//  Created by Warren R. Carithers 2019/11/18.
//  Updated: 2021/11/07 by wrc
//  Copyright 2021 Rochester Institute of Technology.  All rights reserved.
//
//  Contributor: Michael Lee (ml3406) (only hid the coefficients of phong and specular exponent for the three objects)
//

#include "Lighting.h"

#include "Application.h"
#include "Models.h"
#include "Utils.h"

using namespace std;

// lighting data
GLfloat lightcolor[4] = { 1.0f, 1.0f, 1.0f, 1.0f };
GLfloat lightpos[4]   = { 4.0f, 1.0f, 2.0f, 1.0f };
GLfloat amblight[4]   = { 0.5f, 0.5f, 0.5f, 1.0f };

// cube properties
GLfloat amb_cube[4]   = { 0.0f, 1.0f, 0.7f, 1.0f };
GLfloat diff_cube[4]  = { 0.0f, 1.0f, 0.7f, 1.0f };
GLfloat spec_cube[4]  = { 1.0f, 1.0f, 1.0f, 1.0f };
// GLfloat exp_cube      = 50.0f;
// GLfloat k_cube[3]     = { 0.5f, 0.7f, 1.0f };

// cylinder properties
GLfloat amb_cyl[4]    = { 1.0f, 0.3f, 0.0f, 1.0f };
GLfloat diff_cyl[4]   = { 1.0f, 0.3f, 0.0f, 1.0f };
GLfloat spec_cyl[4]   = { 1.0f, 1.0f, 1.0f, 1.0f };
// GLfloat exp_cyl       = 30.0f;
// GLfloat k_cyl[3]      = { 0.5f, 0.7f, 1.0f };

// sphere properties
GLfloat amb_sph[4]    = { 1.0f, 0.3f, 0.7f, 1.0f };
GLfloat diff_sph[4]   = { 1.0f, 0.3f, 0.7f, 1.0f };
GLfloat spec_sph[4]   = { 1.0f, 1.0f, 1.0f, 1.0f };
// GLfloat exp_sph       = 70.0f;
// GLfloat k_sph[3]      = { 0.5f, 0.7f, 1.0f };

///
/// This function sets up the lighting, material, and shading parameters
/// for the shaders.
///
/// @param program  The ID of an OpenGL (GLSL) shader program to which
///    parameter values are to be sent
/// @param object   Which object is currently being drawn
///
void setLighting( GLuint program, Shape object )
{
    GLint loc;

    // Lighting parameters
    loc = getUniformLoc( program, "lightPosition" );
    if( loc >= 0 ) {
        glUniform4fv( loc, 1, lightpos );
    }

    loc = getUniformLoc( program, "lightColor" );
    if( loc >= 0 ) {
        glUniform4fv( loc, 1, lightcolor );
    }

    loc = getUniformLoc( program, "ambientLight" );
    if( loc >= 0 ) {
        glUniform4fv( loc, 1, amblight );
    }

    // Object properties
    GLint dcolor = getUniformLoc( program, "diffuseColor" );
    GLint acolor = getUniformLoc( program, "ambientColor" );
    // GLint coeff  = getUniformLoc( program, "kCoeff" );
    GLint scolor = getUniformLoc( program, "specularColor" );
    // GLint expon  = getUniformLoc( program, "specExp" );

    switch( object ) {
    case Cube:
        glUniform4fv( dcolor, 1, diff_cube );
        glUniform4fv( acolor, 1, amb_cube );
        // glUniform3fv( coeff,  1, k_cube );
        glUniform4fv( scolor, 1, spec_cube );
        // glUniform1f(  expon, exp_cube );
        break;

    case Cylinder:
        glUniform4fv( dcolor, 1, diff_cyl );
        glUniform4fv( acolor, 1, amb_cyl );
        // glUniform3fv( coeff,  1, k_cyl );
        glUniform4fv( scolor, 1, spec_cyl );
        // glUniform1f(  expon, exp_cyl );
        break;

    case Sphere:
        glUniform4fv( dcolor, 1, diff_sph );
        glUniform4fv( acolor, 1, amb_sph );
        // glUniform3fv( coeff,  1, k_sph );
        glUniform4fv( scolor, 1, spec_sph );
        // glUniform1f(  expon, exp_sph );
        break;

    default:
        cerr << "ERROR unknown object " << object << " - ignoring" << endl;
    }
}
