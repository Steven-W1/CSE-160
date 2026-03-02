class Cube {
    constructor(color) {
        this.type = "cube";
       // this.position = [0.0, 0.0, 0.0];
        this.color = color;
       // this.size = 5.0;
       // this.segments = 10;
       this.matrix = new Matrix4();
       this.textureNum = -1; // Default texture number
    }
    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1] );
        // add in the other sides

   // drawTriangle3D( [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
    //drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
        // Top
        drawTriangle3DUV( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0] );

        // Bottom
        drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0, 0,1, 1,1] );

        // Back
        drawTriangle3DUV( [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0.0, 0.0, 1.0,   0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1] );

        // Right side
        drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 0.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1] );
        
        // Left side
        drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,  0.0, 1.0, 1.0], [0,0, 0,1, 1,1] );
    
        }

        renderNorms() {
            var rgba = this.color;
            gl.uniform1i(u_whichTexture, this.textureNum);
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

            var normalMatrix = new Matrix4();
            normalMatrix.setInverseOf(this.matrix);
            normalMatrix.transpose();
            gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

            // Front (z=0, normal points -Z)
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1] );
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1] );
            // Top (y=1, normal points +Y)
            drawTriangle3DUVNormal( [0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0] );
            drawTriangle3DUVNormal( [0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0] );
            // Bottom (y=0, normal points -Y)
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0], [0,0, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0] );
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0] );
            // Back (z=1, normal points +Z)
            drawTriangle3DUVNormal( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1] );
            drawTriangle3DUVNormal( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1] );
            // Right (x=1, normal points +X)
            drawTriangle3DUVNormal( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0] );
            drawTriangle3DUVNormal( [1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0] );
            // Left (x=0, normal points -X)
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0] );
            drawTriangle3DUVNormal( [0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0] );
        }

renderFast() {
    var rgba = this.color;
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Bind vertex buffer (already created)
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Bind UV buffer (already created)
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, g_cubeVertexCount);
}
    }

