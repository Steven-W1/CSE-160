class Cone {
    constructor(color) {
        this.type = "cone";
        this.color = color || [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.segments = 16; // Number of sides for smoothness
    }
    
    render() {
        var rgba = this.color;
        
        // Pass color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var segments = this.segments;
        var angleStep = (2 * Math.PI) / segments;
        
        // Apex at top center (0, 1, 0)
        var apex = [0.0, 1.0, 0.0];
        
        // Base center at origin (0, 0, 0)
        var baseCenter = [0.0, 0.0, 0.0];
        
        // Draw triangular sides (from base edge to apex)
        for (var i = 0; i < segments; i++) {
            var angle1 = i * angleStep;
            var angle2 = (i + 1) * angleStep;
            
            // Points on the base circle (radius = 0.5, at y = 0)
            var x1 = 0.5 * Math.cos(angle1);
            var z1 = 0.5 * Math.sin(angle1);
            
            var x2 = 0.5 * Math.cos(angle2);
            var z2 = 0.5 * Math.sin(angle2);
            
            // Side triangle (base edge to apex)
            drawTriangle3D([
                x1, 0.0, z1,    // Base point 1
                x2, 0.0, z2,    // Base point 2
                apex[0], apex[1], apex[2]  // Apex
            ]);
        }
        
        // Draw base (circle of triangles)
        // Slightly darker color for base
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        
        for (var i = 0; i < segments; i++) {
            var angle1 = i * angleStep;
            var angle2 = (i + 1) * angleStep;

            var x1 = 0.5 * Math.cos(angle1);
            var z1 = 0.5 * Math.sin(angle1);

            var x2 = 0.5 * Math.cos(angle2);
            var z2 = 0.5 * Math.sin(angle2);

            // Base triangle (from center to edge)
            drawTriangle3D([
                baseCenter[0], baseCenter[1], baseCenter[2],  // Center
                x1, 0.0, z1,    // Edge point 1
                x2, 0.0, z2     // Edge point 2
            ]);
        }
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

        var segments = this.segments;
        var angleStep = (2 * Math.PI) / segments;
        // Slant normal factor: cone has apex at (0,1,0), base radius 0.5
        // Outward normal at base vertex (cos(a), 0, sin(a))*0.5 is normalize(cos(a), 0.5, sin(a))
        var s = Math.sqrt(1.25);

        // Side faces with smooth normals
        for (var i = 0; i < segments; i++) {
            var a1 = i * angleStep;
            var a2 = (i + 1) * angleStep;
            var x1 = 0.5 * Math.cos(a1), z1 = 0.5 * Math.sin(a1);
            var x2 = 0.5 * Math.cos(a2), z2 = 0.5 * Math.sin(a2);
            var nx1 = Math.cos(a1)/s, nz1 = Math.sin(a1)/s;
            var nx2 = Math.cos(a2)/s, nz2 = Math.sin(a2)/s;
            var ny  = 0.5/s;
            drawTriangle3DUVNormal(
                [x1, 0, z1,  x2, 0, z2,  0, 1, 0],
                [0,0, 0,0, 0,0],
                [nx1, ny, nz1,  nx2, ny, nz2,  0, 1, 0]
            );
        }

        // Base disk (normal pointing down)
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        for (var i = 0; i < segments; i++) {
            var a1 = i * angleStep;
            var a2 = (i + 1) * angleStep;
            var x1 = 0.5*Math.cos(a1), z1 = 0.5*Math.sin(a1);
            var x2 = 0.5*Math.cos(a2), z2 = 0.5*Math.sin(a2);
            drawTriangle3DUVNormal(
                [0,0,0,  x1,0,z1,  x2,0,z2],
                [0,0, 0,0, 0,0],
                [0,-1,0, 0,-1,0, 0,-1,0]
            );
        }
    }
}