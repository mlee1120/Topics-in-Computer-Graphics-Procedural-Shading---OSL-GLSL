//
//  Models.cpp
//
//  Assignment-specific code for objects.  This module will typically be
//  heavily modified to fit the needs of each assignment.
//
//  Created by Warren R. Carithers on 2021/09/02.
//  Based on earlier versions created by Joe Geigel and Warren R. Carithers
//  Copyright 2021 Rochester Institute of Technology. All rights reserved.
//
//  This file should not be modified by students.
//

#include <iostream>
#include <cmath>

#if defined(_WIN32) || defined(_WIN64)
#include <windows.h>
#endif

#include "Models.h"

using namespace std;

//
// PRIVATE GLOBALS
//

#include "SphereData.h"

//
// PUBLIC FUNCTIONS
//

///
/// createObject - create our Sphere object
///
/// @param C      - the Canvas to use when drawing
///
void createObject( Canvas &C )
{
    for( int i = 0; i < sphereElementsLength - 2; i += 3 ) {

        // Calculate the base indices of the three vertices
        int point1 = sphereElements[i];
        int point2 = sphereElements[i + 1];
        int point3 = sphereElements[i + 2];

        Vertex p1 = sphereVertices[point1];
        Vertex p2 = sphereVertices[point2];
        Vertex p3 = sphereVertices[point3];

        // Calculate the surface normals
        // We just re-use the point indices because the normals
        // for points on a sphere are equal to the coordinates
        // of the points themselves.
        Normal n1 = { sphereVertices[point1].x,
                      sphereVertices[point1].y,
                      sphereVertices[point1].z };

        Normal n2 = { sphereVertices[point2].x,
                      sphereVertices[point2].y,
                      sphereVertices[point2].z };

        Normal n3 = { sphereVertices[point3].x,
                      sphereVertices[point3].y,
                      sphereVertices[point3].z };

        // Add this triangle to the collection
        C.addTriangleWithNorms( p1, n1, p2, n2, p3, n3 );

        // If you need texture coordinates, add the code here
        // to calculate them, and call the addTextureCoords()
        // function to add them to the Canvas.
    }
}
