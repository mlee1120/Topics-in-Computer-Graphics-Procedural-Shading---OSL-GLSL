#version 150 core

//
// Vertex shader for Lab 5 part 1.
//
// @author  RIT CS Department
// @author  Michael Lee (ml3406)
//


// NOTE:  commented-out variables and statements are
// here for future use; they aren't used in the original
// framework for this assignment, but will be needed
// when you implement your solutions.

// INCOMING DATA

// Data from the application

// Vertex position (in model space)
in vec4 vPosition;

// Color associated with this vertex
in vec4 vColor;

// Expansion factor
in float vFactor;

// Radius for the point cloud
in float vRadius;

// OUTGOING DATA

// Vertex color
out vec4 color;

// Expansion factor
out float factor;

// Radius
out float radius;

void main()
{
    gl_Position = vPosition;
    color = vColor;
    factor = vFactor;
    radius = vRadius;
}
