#version 150 core
//
// Geometry shader for Lab 5 part 3.
//
// @author  RIT CS Department
// @author  Michael Lee (ml3406)
//

// INCOMING DATA

// Layout specifications

layout(points) in;
layout(triangle_strip, max_vertices=540) out;

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

    // 4 points for quads (two triangles) (ml3406)
    vec3 point1, point2, point3, point4;
    
    // points after rotation for a better view (ml3406)
    vec3 view_point1, view_point2, view_point3, view_point4;

    // construct a sphere point cloud (ml3406)
    for (int i = 0; i < factor[0]; i++) {
        for (int j = 0; j < factor[0]; j++) {
            // first point (point1) of this latitude (ml3406)
            if (j == 0) {
                point1 = vec3(0.0, radius[0] * cos(PI * i / factor[0]), radius[0] * sin(PI * i / factor[0]));
                point2 = rotate_quaternion(vec4(point1, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
                point3 = rotate_quaternion(vec4(point1, 0.0), vec3(1.0, 0.0, 0.0), PI / factor[0]);
                point4 = rotate_quaternion(vec4(point3, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
            } 
            // rotate 4 points along the latitude (ml3406)
            else {
                point1 = rotate_quaternion(vec4(point1, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
                point2 = rotate_quaternion(vec4(point2, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
                point3 = rotate_quaternion(vec4(point3, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
                point4 = rotate_quaternion(vec4(point4, 0.0), vec3(0.0, 1.0, 0.0), 2 * PI / factor[0]);
            }

            // rotate for a better view (ml3406)
            view_point1 = rotate_quaternion(vec4(point1, 0.0), vec3(0.9, 0.0, -0.3), 30 * PI / 180);
            view_point2 = rotate_quaternion(vec4(point2, 0.0), vec3(0.9, 0.0, -0.3), 30 * PI / 180);
            view_point3 = rotate_quaternion(vec4(point3, 0.0), vec3(0.9, 0.0, -0.3), 30 * PI / 180);
            view_point4 = rotate_quaternion(vec4(point4, 0.0), vec3(0.9, 0.0, -0.3), 30 * PI / 180);
            
            // triangles (no quads) at the top (ml3406)
            if (i == 0) {
                gl_Position = gl_in[0].gl_Position + vec4(view_point1, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point3, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point4, 0.0);
                EmitVertex();
                EndPrimitive();
            } 
            // triangles (no quads) at the bottom (ml3406)
            else if(i == factor[0] - 1) {
                gl_Position = gl_in[0].gl_Position + vec4(view_point1, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point3, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point2, 0.0);
                EmitVertex();
                EndPrimitive();
            }
            // triangles (froming quads) in between  (ml3406)
            else {
                gl_Position = gl_in[0].gl_Position + vec4(view_point1, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point3, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point4, 0.0);
                EmitVertex();
                EndPrimitive();

                gl_Position = gl_in[0].gl_Position + vec4(view_point2, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point1, 0.0);
                EmitVertex();
                gl_Position = gl_in[0].gl_Position + vec4(view_point4, 0.0);
                EmitVertex();
                EndPrimitive();
            }
        }
    }
}
