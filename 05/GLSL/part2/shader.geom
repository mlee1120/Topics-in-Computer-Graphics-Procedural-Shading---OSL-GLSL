#version 150 core
//
// Geometry shader for Lab 5 part 2.
//
// @author  RIT CS Department
// @author  Michael Lee (ml3406)
//

// INCOMING DATA

// Layout specifications

layout(points) in;
layout(line_strip, max_vertices=184) out;

// Data from the vertex shader

in vec4 color[];
// COMMENTED OUT because the original framework doesn't use these
in float factor[];
in float radius[];

// OUTGOING DATA

// Color for this primitive set
out vec4 fColor;

// useful for doing position calculations
const float PI = 3.1415926;

// a function perform rotation via quaternion (ml3406)
vec3 rotate_quaternion(vec4 point, vec3 axis, float theta) {
    // the position of the point after rotation (ml3406)
    vec3 new_point = vec3(0.0);

    // normalize the rotating axis (ml3406)
    axis = normalize(axis);

    // the quaterion x, y, z = sin(theta/2)*axis and w = cos(theta/2) (ml3406)
    vec4 quaternion = vec4(sin(theta / 2) * axis, cos(theta / 2));

    // rotation using quaternion => point' = quaternion * point_quaternion * quaterion^-1 (ml3406)
    float tempW = quaternion.w * point.w - quaternion.x * point.x - quaternion.y * point.y - quaternion.z * point.z;
    float tempX = quaternion.w * point.x + quaternion.x * point.w + quaternion.y * point.z - quaternion.z * point.y;
    float tempY = quaternion.w * point.y - quaternion.x * point.z + quaternion.y * point.w + quaternion.z * point.x;
    float tempZ = quaternion.w * point.z + quaternion.x * point.y - quaternion.y * point.x + quaternion.z * point.w;
    new_point.x += tempW * (-quaternion.x) + tempX * (quaternion.w) + tempY * (-quaternion.z) - tempZ * (-quaternion.y);
    new_point.y += tempW * (-quaternion.y) - tempX * (-quaternion.z) + tempY * (quaternion.w) + tempZ * (-quaternion.x);
    new_point.z += tempW * (-quaternion.z) + tempX * (-quaternion.y) - tempY * (-quaternion.x) + tempZ * (quaternion.w);

    return new_point;
}

void main()
{
    fColor = color[0];

    // a new point (ml3406)
    vec3 point, view_point;
    
    // construct a sphere point cloud (ml3406)
    for (int i = 0; i < factor[0] + 1; i++) {
        for (int j = 0; j < factor[0]; j++) {
            // first point of this latitude (ml3406)
            if (j == 0) {
                point.x = 0.0;
                point.y = radius[0] * cos(PI * i / factor[0]);
                point.z = radius[0] * sin(PI * i / factor[0]);
            } 
            // build points along the latitude (ml3406)
            else point = rotate_quaternion(vec4(point, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);

            // rotate for a better view (ml3406)
            view_point = rotate_quaternion(vec4(point, 0.0), vec3(0.9, 0.0, -0.3), 30 * PI / 180);

            // emit lines (ml3406)
            gl_Position = gl_in[0].gl_Position;
            EmitVertex();
            gl_Position = gl_in[0].gl_Position + vec4(view_point, 0.0);
            EmitVertex();

            // no duplicated point at the top and the bottom of the sphere (ml3406)
            if (i == 0 || i == factor[0]) break;
        }
    }

    EndPrimitive();
}
