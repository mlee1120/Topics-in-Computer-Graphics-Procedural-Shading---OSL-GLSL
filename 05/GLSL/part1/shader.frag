#version 150 core

//
// Fragment shader for Lab 5.
//
// @author  RIT CS Department
// @author  YOUR_NAME_HERE
//

// INCOMING DATA

// Data from the vertex shader

// Color
in vec4 fColor;

// OUTGOING DATA

// The final fragment color
out vec4 fragColor;

void main()
{
    fragColor = fColor;
}
