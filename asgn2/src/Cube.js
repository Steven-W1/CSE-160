class Cube {
    constructor(color) {
        this.type = "cube";
       // this.position = [0.0, 0.0, 0.0];
        this.color = color;
       // this.size = 5.0;
       // this.segments = 10;
       this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        drawTriangle3D( [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0] );
        drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0] );
        // add in the other sides


        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //top
        drawTriangle3D( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,  1.0, 1.0, 1.0] );
        drawTriangle3D( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,  1.0, 1.0, 0.0] );

        //bottom
        drawTriangle3D( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,  1.0, 0.0, 1.0] );
        drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,  1.0, 0.0, 1.0] );
        //back
        drawTriangle3D( [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,  1.0, 0.0, 1.0] );
        drawTriangle3D( [0.0, 0.0, 1.0,   0.0, 1.0, 1.0,  1.0, 1.0, 1.0] );
        //right side
        drawTriangle3D( [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,  1.0, 1.0, 0.0] );
        drawTriangle3D( [1.0, 0.0, 0.0,   1.0, 0.0, 1.0,  1.0, 1.0, 1.0] );
        
        //left side
        drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 1.0, 1.0,  0.0, 1.0, 0.0] );
        drawTriangle3D( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,  0.0, 1.0, 1.0] );
        }
    }

