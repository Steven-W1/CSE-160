class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotation = 0; // ✓ Add rotation property

    }
    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        var d = size / 200.0; // delta
        //drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
var vertices = [
    [0, d],      // Top left
    [d, 0],      // Middle right  
    [0, 0]       // Bottom left (origin)
];
    
        
        // ✓ Apply rotation if you want to use it
        if (this.rotation !== 0) {
            vertices = rotateVertices(vertices, this.rotation);
        }
        
        // Flatten and add position
        drawTriangle([
            xy[0] + vertices[0][0], xy[1] + vertices[0][1],
            xy[0] + vertices[1][0], xy[1] + vertices[1][1],
            xy[0] + vertices[2][0], xy[1] + vertices[2][1]
        ]);
    }
}
    



function drawTriangle(vertices) {
  //var vertices = new Float32Array([
  //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
  //]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}

function drawTriangle3D(vertices) {
  //var vertices = new Float32Array([
  //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
  //]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}



function rotateVertices(vertices, angleDegrees) {
    var angle = angleDegrees * Math.PI / 180;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    
    var rotated = [];
    for (var i = 0; i < vertices.length; i++) {
        var x = vertices[i][0];
        var y = vertices[i][1];
        rotated.push([
            x * cos - y * sin,
            x * sin + y * cos
        ]);
    }
    return rotated;
}
