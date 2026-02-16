// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
}`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;

  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else {
        gl_FragColor = vec4(1.0, 0.2, .2, 1.0); 
    }
  }`

  //Global Variables
let canvas;
let gl;
let a_UV;
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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    //return;
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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
 
}
function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  g_camera = new Camera();
  document.onkeydown = keydown;
  setupMouseControls();
  initTextures(gl);
  initCubeBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}
let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_textures = {};
function initTextures(gl, n) {
  //var texture = gl.createTexture();   // Create a texture object

  const textureFiles = {
    stone: 'stonebrick(1).jpg',
    grass: 'grassblocktop.jpg',
    win: 'fireworks.jpg'
  }

  let loadedCount = 0;
  const totalTextures = Object.keys(textureFiles).length;

  const u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  const u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  const u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  //const u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  //const u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');

  const samplers = [u_Sampler0, u_Sampler1, u_Sampler2/*, u_Sampler3, u_Sampler4*/];
  let textureIndex = 0;
   for (let name in textureFiles) {
    const texture = gl.createTexture();
    const image = new Image();
    const currentIndex = textureIndex;
    
    image.onload = function() {
      loadTexture(gl, texture, samplers[currentIndex], image, currentIndex);
      loadedCount++;
      console.log(`Loaded ${name} (${loadedCount}/${totalTextures})`);
    };
    image.src = textureFiles[name];
    g_textures[name] = currentIndex;
    textureIndex++;
  }
  return true;
}

function loadTexture(gl, texture, u_Sampler0, image, textureUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, textureUnit);
  

}

var g_map = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 4, 4, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 4, 4, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];
function drawMap(){
  for (let x = 0; x < g_map.length; x++){
    for (let y = 0; y < g_map[x].length; y++){
      if (g_map[x][y] > 0){
        for (let i = 0; i < g_map[x][y]; i++){
          var block = new Cube([1.0, 1.0, 1.0, 1.0]);
          block.textureNum = g_textures.chungus;
          block.matrix.scale(0.4, 0.4, 0.4);
          block.matrix.translate(x - 16, -0 + i, y - 16);

          block.renderFast(); // ✓ Make sure you're calling renderFast, not render
        }
      }
    }
  }
}


var g_camera;

function keydown(ev) {
  if (ev.keyCode == 87) { // 'w' key
    g_camera.moveForward();
  } else if (ev.keyCode == 83) { // 's' key
    g_camera.moveBackward();
  } else if (ev.keyCode == 65) { // 'a' key
    g_camera.moveLeft();
  } else if (ev.keyCode == 68) { // 'd' key
    g_camera.moveRight();
  }
  else if (ev.keyCode == 81) { // 'q' key
    g_camera.panLeft();
  }
  else if (ev.keyCode == 69) { // 'e' key
    g_camera.panRight();
  }
  renderAllShapes();
  console.log(ev.keyCode);
}


function setupMouseControls() {
  canvas.onmousedown = function(ev) {
    if (ev.button === 0) { // Left click - Remove block
      removeBlock();
    } else if (ev.button === 1) { // Middle click - Start mouse look
      g_isMouseLooking = true;
      g_mouseLastX = ev.clientX;
      g_mouseLastY = ev.clientY;
      ev.preventDefault();
      
      canvas.style.cursor = 'none';
      console.log('Mouse look activated'); // ✓ Debug
    } else if (ev.button === 2) { // Right click - Add block
      ev.preventDefault();
      addBlock();
    }
  };

  canvas.onmousemove = function(ev) {
    if (g_isMouseLooking) {
      var deltaX = ev.clientX - g_mouseLastX;
      var deltaY = ev.clientY - g_mouseLastY;
      
      var sensitivity = 0.4;
      
      // Debug output
      if (deltaY !== 0) {
        console.log(`DeltaY: ${deltaY}, Pitch: ${g_camera.pitch}`); // ✓ Debug
      }
      
      // Horizontal rotation (left/right)
      if (deltaX !== 0) {
        if (deltaX > 0) {
          g_camera.panLeft(deltaX * sensitivity);
        } else {
          g_camera.panRight(Math.abs(deltaX) * sensitivity);
        }
      }
      
      // Vertical rotation (up/down)
      if (deltaY !== 0) {
        if (deltaY > 0) {
          g_camera.panDown(deltaY * sensitivity); // Mouse down = look down
        } else {
          g_camera.panUp(Math.abs(deltaY) * sensitivity); // Mouse up = look up
        }
      }
      
      g_mouseLastX = ev.clientX;
      g_mouseLastY = ev.clientY;
    }
  };

  canvas.onmouseup = function(ev) {
    if (ev.button === 1) {
      g_isMouseLooking = false;
      canvas.style.cursor = 'default';
      console.log('Mouse look deactivated'); // ✓ Debug
    }
  };

  canvas.onmouseleave = function(ev) {
    g_isMouseLooking = false;
    canvas.style.cursor = 'default';
  };
  
  canvas.oncontextmenu = function(ev) {
    ev.preventDefault();
    return false;
  };
}



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


var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];
function renderAllShapes(){
    var startTime = performance.now();
    var projMat = new Matrix4();


    projMat.setPerspective(50, 1*canvas.width/canvas.height, .1, 100); // maybe 1
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(
      g_camera.eye.components[0], g_camera.eye.components[1], g_camera.eye.components[2],
      g_camera.at.components[0], g_camera.at.components[1], g_camera.at.components[2],
      g_camera.up.components[0], g_camera.up.components[1], g_camera.up.components[2]
      );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);



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


  drawMap();
  //drawCrosshair();
    //sky
  var sky = new Cube([0.5, 0.7, 1.0, 1.0]);
  sky.textureNum = -2;
  sky.matrix.scale(50.0, 50.0, 50.0);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  //floor
  var floor = new Cube([0.0, 1.0, 0.0, 1.0]);
  floor.textureNum = g_textures.grass;
  //floor.matrix.translate(-0.0, -0.55, -5.0);
  floor.matrix.scale(12.50, 0.0, 12.50);
  floor.matrix.translate(-0.5, 4.0, -0.5);
  floor.render();


var cube = new Cube([1.0, 0.0, 0.0, 1.0]); // Red cube
cube.textureNum = g_textures.win;
cube.matrix.scale(0.4, 0.4, 0.4);
cube.matrix.translate(31 - 16, 1, 15 - 16); // Right side, elevated, center Z
cube.render();



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

/*
function getBlockInFrontOfCamera() {
  var camX = g_camera.eye.components[0];
  var camZ = g_camera.eye.components[2];
  
  var forward = g_camera.at.subtract(g_camera.eye);
  var forwardX = forward.components[0];
  var forwardZ = forward.components[2];
  
  var length = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);
  forwardX /= length;
  forwardZ /= length;
  
  // Position in front of camera - adjust this distance
  var targetX = camX + forwardX * -.0; // ✓ Adjust this value
  var targetZ = camZ + forwardZ * -.5; // ✓ Adjust this value
  
  var mapX = Math.floor(targetX + 16);
  var mapZ = Math.floor(targetZ + 16);
  
  // Debug output
  console.log(`Camera: (${camX.toFixed(2)}, ${camZ.toFixed(2)})`);
  console.log(`Target: (${targetX.toFixed(2)}, ${targetZ.toFixed(2)})`);
  console.log(`Map coords: (${mapX}, ${mapZ})`);
  
  if (mapX >= 0 && mapX < g_map.length && mapZ >= 0 && mapZ < g_map[0].length) {
    return {x: mapX, z: mapZ};
  }
  
  return null;
}
*/

function getBlockInFrontOfCamera() {
  var rayStart = g_camera.eye;
  var forward = g_camera.at.subtract(g_camera.eye);
  forward = forward.normalize();
  
  console.log("=== Block Placement Debug ===");
  console.log(`Eye: (${rayStart.components[0].toFixed(2)}, ${rayStart.components[2].toFixed(2)})`);
  console.log(`Forward: (${forward.components[0].toFixed(2)}, ${forward.components[2].toFixed(2)})`);
  
  var maxDistance = 5.0;
  var stepSize = 0.2;
  
  for (let dist = 0.5; dist < maxDistance; dist += stepSize) {
    var rayX = rayStart.components[0] + forward.components[0] * dist;
    var rayY = rayStart.components[1] + forward.components[1] * dist;
    var rayZ = rayStart.components[2] + forward.components[2] * dist;
    
    // Convert world to map coordinates
    var mapX = Math.floor(rayX / 0.4 + 16);
    var mapZ = Math.floor(rayZ / 0.4 + 16);
    var mapY = Math.floor(rayY / 0.4); // ✓ Simplified Y calculation
    
    if (mapX >= 0 && mapX < g_map.length && mapZ >= 0 && mapZ < g_map[0].length) {
      if (g_map[mapX][mapZ] > 0 && mapY < g_map[mapX][mapZ]) {
        console.log(`✓ HIT at dist ${dist.toFixed(2)}: world (${rayX.toFixed(2)}, ${rayZ.toFixed(2)}) -> map (${mapX}, ${mapZ})`);
        return {x: mapX, z: mapZ};
      }
    }
  }
  
  // No hit - place at crosshair position
  var placeDistance = 2.5;
  var placeX = rayStart.components[0] + forward.components[0] * placeDistance;
  var placeZ = rayStart.components[2] + forward.components[2] * placeDistance;
  
  var mapX = Math.floor(placeX / 0.4 + 16);
  var mapZ = Math.floor(placeZ / 0.4 + 16);
  
  console.log(`✗ NO HIT - placing at dist ${placeDistance}: world (${placeX.toFixed(2)}, ${placeZ.toFixed(2)}) -> map (${mapX}, ${mapZ})`);
  
  if (mapX >= 0 && mapX < g_map.length && mapZ >= 0 && mapZ < g_map[0].length) {
    return {x: mapX, z: mapZ};
  }
  
  return null;
}
function removeBlock() {
  var result = getBlockInFrontOfCamera();
  
  if (result && g_map[result.x][result.z] > 0) {
    g_map[result.x][result.z]--;
    console.log(`Removed block at (${result.x}, ${result.z}), height now: ${g_map[result.x][result.z]}`);
  } else {
    console.log("No block to remove");
  }
}

function addBlock() {
  var result = getBlockInFrontOfCamera();
  
  if (result) {
    // Add block on top of existing stack (or create new stack)
    g_map[result.x][result.z]++;
    console.log(`Added block at (${result.x}, ${result.z}), height now: ${g_map[result.x][result.z]}`);
  } else {
    console.log("Cannot place block there");
  }
}


// Add this to renderAllShapes() - draw a small cube at the target position
function drawCrosshair() {
  var forward = g_camera.at.subtract(g_camera.eye);
  forward = forward.normalize();
  
  // Position 2.5 units in front of camera
  var targetX = g_camera.eye.components[0] + forward.components[0] * 2.5;
  var targetY = g_camera.eye.components[1] + forward.components[1] * 2.5;
  var targetZ = g_camera.eye.components[2] + forward.components[2] * 2.5;
  
  // Draw a small red cube at target
  var crosshair = new Cube([1.0, 0.0, 0.0, 1.0]);
  crosshair.textureNum = -2;
  crosshair.matrix.translate(targetX, targetY, targetZ);
  crosshair.matrix.scale(0.1, 0.1, 0.1);
  crosshair.render();
  
  //console.log(`Crosshair at world: (${targetX.toFixed(2)}, ${targetY.toFixed(2)}, ${targetZ.toFixed(2)})`);
}