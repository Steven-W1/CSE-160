// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 

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
let u_ModelMatrix;
let g_selectedSegments = 10;
let g_selectedRotation = 0;
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); 
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);
  //gl.cullFace(gl.BACK);
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


  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
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
let g_globalAngle = 0;
let g_zoom = 1.;
let g_globalAngleX = 0;  // Vertical rotation
let g_globalAngleY = 0; 
let g_yellowArmAngle = 0;
let g_magentaArmAngle = 0;
let g_redArmAngle = 0;

let g_frontLeftHip = 0;
let g_frontLeftKnee = 0;
let g_frontLeftAnkle = 0;

let g_frontRightHip = 0;
let g_frontRightKnee = 0;
let g_frontRightAnkle = 0;

let g_backLeftHip = 0;
let g_backLeftKnee = 0;
let g_backLeftAnkle = 0;

let g_backRightHip = 0;
let g_backRightKnee = 0;
let g_backRightAnkle = 0;


let g_frontRightHipManual = 0;
let g_frontRightKneeManual = 0;
let g_frontRightAnkleManual = 0;


let g_animateAll = false;
let g_animateYellow = false;
let g_animateMagenta = false;
let g_animateRed = false;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
function addActionsForHtmlUI(){
  // Zoom
  document.getElementById('distSlide').addEventListener('input', function() { 
    g_zoom = this.value; 
  });

  // Global angle slider (nudge control)
  document.getElementById('angleSlide').addEventListener('input', function() { 
    let sliderValue = parseFloat(this.value);
    g_globalAngleY += sliderValue - (this.lastValue || 0);
    this.lastValue = sliderValue;
  });
  
  document.getElementById('angleSlide').addEventListener('mouseup', function() {
    this.value = 0;
    this.lastValue = 0;
  });


  // ✓ NEW: Animate All ON/OFF buttons
  document.getElementById('animateAllOnButton').onclick = function() {
    g_animateAll = true;
  };

  document.getElementById('animateAllOffButton').onclick = function() {
    g_animateAll = false;
    // Reset manual controls when stopping animation
    g_frontRightHipManual = 0;
    g_frontRightKneeManual = 0;
    g_frontRightAnkleManual = 0;
  };

  // Individual animation controls
  document.getElementById('animateYellowOnButton').onclick = function() { 
    g_animateYellow = true; 
  };
  document.getElementById('animateYellowOffButton').onclick = function() { 
    g_animateYellow = false; 
  };

  document.getElementById('animateMagentaOnButton').onclick = function() { 
    g_animateMagenta = true; 
  };
  document.getElementById('animateMagentaOffButton').onclick = function() { 
    g_animateMagenta = false; 
  };

  document.getElementById('animateRedOnButton').onclick = function() { 
    g_animateRed = true; 
  };
  document.getElementById('animateRedOffButton').onclick = function() { 
    g_animateRed = false; 
  };

  // ✓ NEW: Manual control sliders for front right leg
  document.getElementById('frontRightHipSlide').addEventListener('input', function() { 
    if (!g_animateAll) {
      g_frontRightHipManual = parseFloat(this.value);
    }
  });

  document.getElementById('frontRightKneeSlide').addEventListener('input', function() { 
    if (!g_animateAll) {
      g_frontRightKneeManual = parseFloat(this.value);
    }
  });

  document.getElementById('frontRightAnkleSlide').addEventListener('input', function() { 
    if (!g_animateAll) {
      g_frontRightAnkleManual = parseFloat(this.value);
    }
  });

  // Reset view
  document.getElementById('resetView').onclick = function() {
    g_globalAngleX = 0;
    g_globalAngleY = 0;
    g_zoom = 1.0;
    document.getElementById('angleSlide').value = 0;
  };
}
function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  setupMouseControls();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}
let g_pokeAnimation = false;
let g_pokeStartTime = 0;

function setupMouseControls() {
  canvas.onmousedown = function(ev) {
    if (ev.button === 0) {
      // ✓ Check for shift-click
      if (ev.shiftKey) {
        // Shift-click: trigger poke animation
        g_pokeAnimation = true;
        g_pokeStartTime = g_seconds;
      } else {
        // Regular click: drag to rotate
        g_isDragging = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
      }
    }
  };

  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      var deltaX = ev.clientX - g_lastMouseX;
      var deltaY = ev.clientY - g_lastMouseY;
      
      g_globalAngleY += deltaX * 0.5;
      g_globalAngleX += deltaY * 0.5;
      
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  };

  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  };

  canvas.onmouseleave = function(ev) {
    g_isDragging = false;
  };
}
/*function setupMouseControls() {
  canvas.onmousedown = function(ev) {
    if (ev.button === 0) { // Left mouse button
      g_isDragging = true;
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  };

  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      // Calculate how far the mouse moved
      var deltaX = ev.clientX - g_lastMouseX;
      var deltaY = ev.clientY - g_lastMouseY;
      
      // Update rotation angles (sensitivity factor 0.5)
      g_globalAngleY += deltaX * 0.5;
      g_globalAngleX += deltaY * 0.5;
      
      // Update last mouse position
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
      

    }
  };

  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  };

  // Stop dragging if mouse leaves canvas
  canvas.onmouseleave = function(ev) {
    g_isDragging = false;
  };
//}
*/
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
    if (point.type === 'circle') {
    point.segments = g_selectedSegments;
  }
  
  if (point.type === 'triangle') {
    point.rotation = g_selectedRotation;
  }
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
    var startTime = performance.now();
  var globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0)
    .rotate(g_globalAngleY + g_globalAngle, 0, 1, 0)
    .scale(g_zoom, g_zoom, g_zoom);   
     gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var picLen = g_pictureTriangles.length;
  for(var i = 0; i < picLen; i++) {
    g_pictureTriangles[i].render();
  }

  var body = new Cube([0.5, 0.35, 0.05, 1.0]);
  body.matrix.setTranslate(0.0, 0.0, 0.0);
  body.matrix.scale(1.0, 0.5, 0.6);
  var bodyCoordinateMat = new Matrix4(body.matrix);
  body.matrix.translate(-.5, -.3, -.4);
  body.render();

  var head = new Cube([0.4, 0.3, 0.2, 1.0]);
  head.matrix = new Matrix4(bodyCoordinateMat);
  head.matrix.translate(0.5, 0.3, -0.1);
  head.matrix.scale(0.5, 0.6, 0.5);
  head.render();

  var rightHorn = new Cone([0.96, 0.87, 0.70, 1.0]);
  rightHorn.matrix = new Matrix4(bodyCoordinateMat);
  rightHorn.matrix.translate(0.7, 0.91, 0.);
  rightHorn.matrix.scale(0.15, 0.3, 0.15);
  rightHorn.render();

  var leftHorn = new Cone([0.96, 0.87, 0.70, 1.0]);
  leftHorn.matrix = new Matrix4(bodyCoordinateMat);
  leftHorn.matrix.translate(0.7, 0.91, 0.3);
  leftHorn.matrix.scale(0.15, 0.3, 0.15);
  leftHorn.render();

  var tail = new Cube([0.3, 0.2, 0.1, 1.0]);
  tail.matrix = new Matrix4(bodyCoordinateMat);
  tail.matrix.translate(-.75, 0.0, 0.0);
  tail.matrix.rotate(-30 + 15 * Math.sin(g_seconds * 3), 0, 0, 1);
  tail.matrix.scale(0.15, 0.5, 0.15);
  tail.render();

  // ===== FRONT LEFT LEG ===== (Pair with Back Right)
  var frontLeftHip = new Cube([0.6, 0.4, 0.2, 1.0]);
  frontLeftHip.matrix = new Matrix4(bodyCoordinateMat);
  frontLeftHip.matrix.translate(0.3, -0.5, 0.3);
  frontLeftHip.matrix.rotate(g_frontLeftHip, 0, 0, 1);  // ✓ NEW variable
  var frontLeftHipMat = new Matrix4(frontLeftHip.matrix);
  frontLeftHip.matrix.scale(0.2, 0.2, 0.2);
  frontLeftHip.matrix.translate(-0.5, 0, 0);
  frontLeftHip.render();

  var frontLeftThigh = new Cube([0.6, 0.4, 0.2, 1.0]);
  frontLeftThigh.matrix = frontLeftHipMat;
  frontLeftThigh.matrix.translate(0.0, -0.2, 0.0);
  frontLeftThigh.matrix.rotate(-g_frontLeftKnee, 0, 0, 1);  // ✓ NEW variable
  var frontLeftKneeMat = new Matrix4(frontLeftThigh.matrix);
  frontLeftThigh.matrix.scale(0.15, 0.5, 0.15);
  frontLeftThigh.matrix.translate(-0.5, -0.3, 0.0);
  frontLeftThigh.render();

  var frontLeftFoot = new Cube([0.2, 0.2, 0.2, 1.0]);
  frontLeftFoot.matrix = frontLeftKneeMat;
  frontLeftFoot.matrix.translate(0.0, -0.4, 0.0);
  frontLeftFoot.matrix.rotate(g_frontLeftAnkle, 0, 0, 1);  // ✓ NEW variable
  frontLeftFoot.matrix.scale(0.18, 0.25, 0.18);
  frontLeftFoot.matrix.translate(-0.5, 0.0, 0.0);
  frontLeftFoot.render();

  // ===== FRONT RIGHT LEG ===== (Pair with Back Left)
  var frontRightHip = new Cube([0.6, 0.4, 0.2, 1.0]);
  frontRightHip.matrix = new Matrix4(bodyCoordinateMat);
  frontRightHip.matrix.translate(0.3, -0.5, -0.3);
  frontRightHip.matrix.rotate(g_frontRightHip, 0, 0, 1);  // ✓ NEW variable
  var frontRightHipMat = new Matrix4(frontRightHip.matrix);
  frontRightHip.matrix.scale(0.2, 0.2, 0.2);
  frontRightHip.matrix.translate(-0.5, 0, 0);
  frontRightHip.render();

  var frontRightThigh = new Cube([0.6, 0.4, 0.2, 1.0]);
  frontRightThigh.matrix = frontRightHipMat;
  frontRightThigh.matrix.translate(0.0, -0.2, 0.0);
  frontRightThigh.matrix.rotate(-g_frontRightKnee, 0, 0, 1);  // ✓ NEW variable
  var frontRightKneeMat = new Matrix4(frontRightThigh.matrix);
  frontRightThigh.matrix.scale(0.15, 0.5, 0.15);
  frontRightThigh.matrix.translate(-0.5, -0.3, 0.0);
  frontRightThigh.render();

  var frontRightFoot = new Cube([0.2, 0.2, 0.2, 1.0]);
  frontRightFoot.matrix = frontRightKneeMat;
  frontRightFoot.matrix.translate(0.0, -0.4, 0.0);
  frontRightFoot.matrix.rotate(g_frontRightAnkle, 0, 0, 1);  // ✓ NEW variable
  frontRightFoot.matrix.scale(0.18, 0.25, 0.18);
  frontRightFoot.matrix.translate(-0.5, 0.0, 0.0);
  frontRightFoot.render();

  // ===== BACK LEFT LEG ===== (Pair with Front Right)
  var backLeftHip = new Cube([0.6, 0.4, 0.2, 1.0]);
  backLeftHip.matrix = new Matrix4(bodyCoordinateMat);
  backLeftHip.matrix.translate(-0.3, -0.5, 0.3);
  backLeftHip.matrix.rotate(g_backLeftHip, 0, 0, 1);  // ✓ NEW variable
  var backLeftHipMat = new Matrix4(backLeftHip.matrix);
  backLeftHip.matrix.scale(0.2, 0.2, 0.2);
  backLeftHip.matrix.translate(-0.5, 0, 0);
  backLeftHip.render();

  var backLeftThigh = new Cube([0.6, 0.4, 0.2, 1.0]);
  backLeftThigh.matrix = backLeftHipMat;
  backLeftThigh.matrix.translate(0.0, -0.2, 0.0);
  backLeftThigh.matrix.rotate(g_backLeftKnee, 0, 0, 1);  // ✓ NEW variable
  var backLeftKneeMat = new Matrix4(backLeftThigh.matrix);
  backLeftThigh.matrix.scale(0.15, 0.5, 0.15);
  backLeftThigh.matrix.translate(-0.5, -0.3, 0.0);
  backLeftThigh.render();

  var backLeftFoot = new Cube([0.2, 0.2, 0.2, 1.0]);
  backLeftFoot.matrix = backLeftKneeMat;
  backLeftFoot.matrix.translate(0.0, -0.4, 0.0);
  backLeftFoot.matrix.rotate(g_backLeftAnkle, 0, 0, 1);  // ✓ NEW variable
  backLeftFoot.matrix.scale(0.18, 0.25, 0.18);
  backLeftFoot.matrix.translate(-0.5, 0.0, 0.0);
  backLeftFoot.render();

  // ===== BACK RIGHT LEG ===== (Pair with Front Left)
  var backRightHip = new Cube([0.6, 0.4, 0.2, 1.0]);
  backRightHip.matrix = new Matrix4(bodyCoordinateMat);
  backRightHip.matrix.translate(-0.3, -0.5, -0.3);
  backRightHip.matrix.rotate(g_backRightHip, 0, 0, 1);  // ✓ NEW variable
  var backRightHipMat = new Matrix4(backRightHip.matrix);
  backRightHip.matrix.scale(0.2, 0.2, 0.2);
  backRightHip.matrix.translate(-0.5, 0, 0);
  backRightHip.render();

  var backRightThigh = new Cube([0.6, 0.4, 0.2, 1.0]);
  backRightThigh.matrix = backRightHipMat;
  backRightThigh.matrix.translate(0.0, -0.2, 0.0);
  backRightThigh.matrix.rotate(g_backRightKnee, 0, 0, 1);  // ✓ NEW variable
  var backRightKneeMat = new Matrix4(backRightThigh.matrix);
  backRightThigh.matrix.scale(0.15, 0.5, 0.15);
  backRightThigh.matrix.translate(-0.5, -0.3, 0.0);
  backRightThigh.render();

  var backRightFoot = new Cube([0.2, 0.2, 0.2, 1.0]);
  backRightFoot.matrix = backRightKneeMat;
  backRightFoot.matrix.translate(0.0, -0.4, 0.0);
  backRightFoot.matrix.rotate(g_backRightAnkle, 0, 0, 1);  // ✓ NEW variable
  backRightFoot.matrix.scale(0.18, 0.25, 0.18);
  backRightFoot.matrix.translate(-0.5, 0.0, 0.0);
  backRightFoot.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + "fps:  " + Math.floor(10000/duration), "numdot");
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



var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
/*
function updateAnimationAngles() { 
  if (g_animateAll == true) {
    let walkCycle = g_seconds * 1.5;
    
    // DIAGONAL PAIR 1: Front Left + Back Right
    g_frontLeftHip = 35 * Math.sin(walkCycle);
    g_frontLeftKnee = -25 * Math.sin(walkCycle + Math.PI);
    g_frontLeftAnkle = -15 * Math.sin(walkCycle + Math.PI/2);
    
    g_backRightHip = 35 * Math.sin(walkCycle);
    g_backRightKnee = 25 * Math.sin(walkCycle + Math.PI);
    g_backRightAnkle = -15 * Math.sin(walkCycle + Math.PI/2);
    
    // DIAGONAL PAIR 2: Front Right + Back Left
    g_frontRightHip = 35 * Math.sin(walkCycle + Math.PI);
    g_frontRightKnee = -25 * Math.sin(walkCycle);
    g_frontRightAnkle = -15 * Math.sin(walkCycle + 3*Math.PI/2);
    
    g_backLeftHip = 35 * Math.sin(walkCycle + Math.PI);
    g_backLeftKnee = 25 * Math.sin(walkCycle);
    g_backLeftAnkle = -15 * Math.sin(walkCycle + 3*Math.PI/2);
  } else {
    // ✓ NEW: When animation is OFF, use manual slider values for front right leg
    g_frontRightHip = g_frontRightHipManual;
    g_frontRightKnee = g_frontRightKneeManual;
    g_frontRightAnkle = g_frontRightAnkleManual;
    
    // Other legs stay at 0
    g_frontLeftHip = 0;
    g_frontLeftKnee = 0;
    g_frontLeftAnkle = 0;
    
    g_backLeftHip = 0;
    g_backLeftKnee = 0;
    g_backLeftAnkle = 0;
    
    g_backRightHip = 0;
    g_backRightKnee = 0;
    g_backRightAnkle = 0;
  }

}
  */


function updateAnimationAngles() { 
  if (g_animateAll == true) {
    // Full walking animation
    let walkCycle = g_seconds * 1.5;
    
    g_frontLeftHip = 35 * Math.sin(walkCycle);
    g_frontLeftKnee = -25 * Math.sin(walkCycle + Math.PI);
    g_frontLeftAnkle = -15 * Math.sin(walkCycle + Math.PI/2);
    
    g_backRightHip = 35 * Math.sin(walkCycle);
    g_backRightKnee = 25 * Math.sin(walkCycle + Math.PI);
    g_backRightAnkle = -15 * Math.sin(walkCycle + Math.PI/2);
    
    g_frontRightHip = 35 * Math.sin(walkCycle + Math.PI);
    g_frontRightKnee = -25 * Math.sin(walkCycle);
    g_frontRightAnkle = -15 * Math.sin(walkCycle + 3*Math.PI/2);
    
    g_backLeftHip = 35 * Math.sin(walkCycle + Math.PI);
    g_backLeftKnee = 25 * Math.sin(walkCycle);
    g_backLeftAnkle = -15 * Math.sin(walkCycle + 3*Math.PI/2);
  } else {
    g_frontRightHip = g_frontRightHipManual;
    g_frontRightKnee = g_frontRightKneeManual;
    g_frontRightAnkle = g_frontRightAnkleManual;
    
    g_frontLeftHip = 0;
    g_frontLeftKnee = 0;
    g_frontLeftAnkle = 0;
    
    g_backLeftHip = 0;
    g_backLeftKnee = 0;
    g_backLeftAnkle = 0;
    
    g_backRightHip = 0;
    g_backRightKnee = 0;
    g_backRightAnkle = 0;
  }

  // Individual animations - ONLY Front Right Leg
  if (g_animateMagenta == true) {
    g_frontRightHip = 45 * Math.sin(3 * g_seconds);
  }

  if (g_animateYellow == true) {
    g_frontRightKnee = -45 * Math.sin(3 * g_seconds);
  }

  if (g_animateRed == true) {
    g_frontRightAnkle = -45 * Math.sin(3 * g_seconds);
  }

  // ✓ NEW: Poke animation (shift-click)
  if (g_pokeAnimation == true) {
    let pokeTime = g_seconds - g_pokeStartTime;
    
    // Animation lasts 1.5 seconds
    if (pokeTime < 1.5) {
      // Cow jumps up and down
      let jumpAmount = Math.sin(pokeTime * 4) * Math.exp(-pokeTime * 2);
      
      // This would need to be applied in renderAllShapes to the body
      // For now, make all legs kick out
      g_frontLeftHip = 60 * jumpAmount;
      g_frontRightHip = 60 * jumpAmount;
      g_backLeftHip = 60 * jumpAmount;
      g_backRightHip = 60 * jumpAmount;
      
      g_frontLeftKnee = -40 * jumpAmount;
      g_frontRightKnee = -40 * jumpAmount;
      g_backLeftKnee = 40 * jumpAmount;
      g_backRightKnee = 40 * jumpAmount;
    } else {
      // Animation finished
      g_pokeAnimation = false;
    }
  }
}


