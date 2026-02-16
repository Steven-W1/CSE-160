class Cone {
    constructor(color) {
        this.type = "cone";
        this.color = color || [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
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
}