// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position; 
    gl_PointSize = u_Size;
}`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform
  void main() {
    gl_FragColor = u_FragColor;
  }`

  //Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); 
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}


function connectVariablesToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//global for ui elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // Default color is red
let g_selectedSize = 5;
let g_selectedType = POINT;
function addActionsForHtmlUI(){

  // Add actions for HTML UI elements
  document.getElementById('picture').onclick = function() { drawMyPicture();  };

  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; }; // Change color to red
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; }; // Change color to green
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; g_pictureTriangles = [];     renderAllShapes();}; // Clear canvas

  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT }; // Change color to blue
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE }; // Change color to blue
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE }; // Change color to blue

  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev);}; }; // Mouse is moved
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []; // The array for the shapes


function click(ev) {
  let [x, y] = connectCoordinatesToGL(ev);
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
    } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
    } else
    {
    point = new Circle();
    }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}


function connectCoordinatesToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes(){
    // Clear <canvas>
    var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT);


    var picLen = g_pictureTriangles.length;
  for(var i = 0; i < picLen; i++) {
    g_pictureTriangles[i].render();
  }


  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + "fps:  " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

var g_pictureTriangles = [];

function drawMyPicture() {
  g_pictureTriangles = [];

  //left lake
  var tri1 = new Triangle();
  tri1.position = [-1.0, -0.85, 0.0]; // Center position
  tri1.color = [0.0, 0.0, 1.0, 1.0]; // Brown
  tri1.size = 160; // Adjust size
  tri1.rotation = 45; // Rotate 45 degrees
  g_pictureTriangles.push(tri1);
  
  var tri2 = new Triangle();
  tri2.position = [-0.4, -1.0, 0.0];
  tri2.color = [0.0, 0.0, 1.0, 1.0]; // blue
  tri2.size = 150;
  tri2.rotation = 90; // Rotate 45 degrees

  g_pictureTriangles.push(tri2);  

  //right lake
  var tri3 = new Triangle();
  tri3.position = [1.0, -0.85, 0.0]; // Center position
  tri3.color = [0.0, 0.0, 1.0, 1.0]; 
  tri3.size = 160; // Adjust size
  tri3.rotation = 45; // Rotate 45 degrees
  g_pictureTriangles.push(tri3);
  
  var tri4 = new Triangle();
  tri4.position = [0.4, -1.0, 0.0];
  tri4.color = [0.0, 0.0, 1.0, 1.0]; // Red
  tri4.size = 150;
  tri4.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri4);  


  //middle lake
  var tri5 = new Triangle();
  tri5.position = [-0.4, -1.0, 0.0]; // Center position
  tri5.color = [0.37, 0.54, 0.9, 1.0]; 
  tri5.size = 150; // Adjust size
  tri5.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri5);

    var tri6 = new Triangle();
  tri6.position = [0.4, -0.3, 0.0]; // Center position
  tri6.color = [0.37, 0.54, 0.9, 1.0]; 
  tri6.size = 150; // Adjust size
  tri6.rotation = 180; // Rotate 45 degrees
  g_pictureTriangles.push(tri6);

//left rock

  var tri7 = new Triangle();
  tri7.position = [-1.0, -0.3, 0.0]; // Center position
  tri7.color = [0.4, 0.25, 0.1, 1.0];
  tri7.size = 150; // Adjust size
  tri7.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri7);

    var tri8 = new Triangle();
  tri8.position = [-0.3, 0.5, 0.0]; // Center position
  tri8.color = [0.4, 0.25, 0.1, 1.0];
  tri8.size = 150; // Adjust size
  tri8.rotation = 180; // Rotate 45 degrees
  g_pictureTriangles.push(tri8);


  //right rock
    var tri9 = new Triangle();
  tri9.position = [0.3, -0.3, 0.0]; // Center position
  tri9.color = [0.4, 0.25, 0.1, 1.0];
  tri9.size = 150; // Adjust size
  tri9.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri9);

    var tri10 = new Triangle();
  tri10.position = [1.0, 0.5, 0.0]; // Center position
  tri10.color = [0.4, 0.25, 0.1, 1.0];
  tri10.size = 150; // Adjust size
  tri10.rotation = 180; // Rotate 45 degrees
  g_pictureTriangles.push(tri10);


  //waterfall center
    var tri11 = new Triangle();
  tri11.position = [-0.3, -0.3, 0.0]; // Center position
  tri11.color = [0.5, 0.7, 1.0, 1.0];
  tri11.size = 135; // Adjust size
  tri11.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri11);

    var tri12 = new Triangle();
  tri12.position = [0.35, 0.4, 0.0]; // Center position
  tri12.color = [0.5, 0.7, 1.0, 1.0];
  tri12.size = 135; // Adjust size
  tri12.rotation = 180; // Rotate 45 degrees
  g_pictureTriangles.push(tri12);

  //left tree
      var tri13 = new Triangle(); //upper
  tri13.position = [-0.55, 0.73, 0.0]; // Center position
  tri13.color = [0.13, 0.55, 0.13, 1.0];
  tri13.size = 40; // Adjust size
  tri13.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri13);


      var tri14 = new Triangle(); //lower
  tri14.position = [-0.55, 0.67, 0.0]; // Center position
  tri14.color = [0.13, 0.55, 0.13, 1.0];
  tri14.size = 50; // Adjust size
  tri14.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri14);

        var tri15 = new Triangle(); //top
  tri15.position = [-0.55, 0.78, 0.0]; // Center position
  tri15.color = [0.13, 0.55, 0.13, 1.0];
  tri15.size = 30; // Adjust size
  tri15.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri15);

  //right tree
      var tri16 = new Triangle(); //upper
  tri16.position = [0.55, 0.73, 0.0]; // Center position
  tri16.color = [0.13, 0.55, 0.13, 1.0];
  tri16.size = 40; // Adjust size
  tri16.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri16);


      var tri17 = new Triangle(); //lower
  tri17.position = [0.55, 0.67, 0.0]; // Center position
  tri17.color = [0.13, 0.55, 0.13, 1.0];
  tri17.size = 50; // Adjust size
  tri17.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri17);

          var tri18 = new Triangle(); //top
  tri18.position = [0.55, 0.78, 0.0]; // Center position
  tri18.color = [0.13, 0.55, 0.13, 1.0];
  tri18.size = 30; // Adjust size
  tri18.rotation = 225; // Rotate 45 degrees
  g_pictureTriangles.push(tri18);



    //boat
        var tri19 = new Triangle(); //top
  tri19.position = [-0.55, -0.83, 0.0]; // Center position
  tri19.color = [0.7, 0.25, 0.15, 1.0];
  tri19.size = 50; // Adjust size
  tri19.rotation = 45; // Rotate 45 degrees
  g_pictureTriangles.push(tri19);

  //sail
          var tri20 = new Triangle(); //top
  tri20.position = [-0.59, -0.66, 0.0]; // Center position
  tri20.color = [0.98, 0.94, 0.8, 1.0];
  tri20.size = 40; // Adjust size
  tri20.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri20);

    //sail
          var tri20 = new Triangle(); //top
  tri20.position = [-0.5, -0.66, 0.0]; // Center position
  tri20.color = [0.85, 0.75, 0.35, 1.0];
  tri20.size = 25; // Adjust size
  tri20.rotation = 0; // Rotate 45 degrees
  g_pictureTriangles.push(tri20);
renderAllShapes();

}