// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = u_ModelMatrix * a_Position;
}`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform vec3 u_cameraPos;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightDirection;
  uniform float u_innerLimit;
  uniform float u_outerLimit;
  uniform mat4 u_NormalMatrix;
  varying vec4 v_VertPos;
  uniform int u_whichTexture;
  uniform bool u_lightOn;
  uniform bool u_spotlightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    }
    else if (u_whichTexture == -2) {
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
      
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    //if (r < 1.0) {
    //  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for light source
    //} else if (r < 2.0) {
    //  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green for inside light radius
    //}

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);

    float inLight = 1.0;
    if (u_spotlightOn) {
      float dotFromDirection = dot(L, -normalize(u_lightDirection));
      inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);
    }

    float nDotL = inLight * max(dot(N, L), 0.0);

    vec3 R = reflect(-L, N); //reflection vector

    vec3 E = normalize(u_cameraPos - vec3(v_VertPos)); //eye vector

    float specular = inLight * pow(max(dot(R, E), 0.0), 64.0);
    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    vec3 specularColor = vec3(gl_FragColor) * specular;
    if (u_lightOn) {
      gl_FragColor = vec4(diffuse + ambient + specularColor, 1.0);
    } else {
      gl_FragColor = vec4(ambient + diffuse, 1.0);
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
let u_lightPos;
let u_lightDirection;
let u_innerLimit;
let u_outerLimit;
let u_spotlightOn;
let u_NormalMatrix;
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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection');
  u_innerLimit     = gl.getUniformLocation(gl.program, 'u_innerLimit');
  u_outerLimit     = gl.getUniformLocation(gl.program, 'u_outerLimit');
  u_spotlightOn    = gl.getUniformLocation(gl.program, 'u_spotlightOn');
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
let g_normalOn = false;
let g_model;
let g_lightPos = [0,1,-2];
let g_spotlightOn = false;
let g_innerAngle = 15;
let g_outerAngle = 20;

function addActionsForHtmlUI(){
  document.getElementById('orbitSlider').addEventListener('input', function() {
    g_globalAngle = parseFloat(this.value);
  });

 document.getElementById('normalOn').onclick = function() { g_normalOn = true; renderAllShapes(); };
 document.getElementById('normalOff').onclick = function() { g_normalOn = false; renderAllShapes(); };
 document.getElementById('lightXSlider').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes(); } });
 document.getElementById('lightYSlider').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes(); } });
 document.getElementById('lightZSlider').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes(); } });
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; renderAllShapes(); };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; renderAllShapes(); };
  document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true; renderAllShapes(); };
  document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false; renderAllShapes(); };
  document.getElementById('animateAllOnButton').onclick = function() { g_animateAll = true; };
  document.getElementById('animateAllOffButton').onclick = function() {
    g_animateAll = false;
    g_frontRightHipManual = 0; g_frontRightKneeManual = 0; g_frontRightAnkleManual = 0;
  };
  document.getElementById('animateYellowOnButton').onclick  = function() { g_animateYellow = true; };
  document.getElementById('animateYellowOffButton').onclick = function() { g_animateYellow = false; };
  document.getElementById('animateMagentaOnButton').onclick  = function() { g_animateMagenta = true; };
  document.getElementById('animateMagentaOffButton').onclick = function() { g_animateMagenta = false; };
  document.getElementById('animateRedOnButton').onclick  = function() { g_animateRed = true; };
  document.getElementById('animateRedOffButton').onclick = function() { g_animateRed = false; };
  document.getElementById('frontRightHipSlide').addEventListener('input', function() {
    if (!g_animateAll) g_frontRightHipManual = parseFloat(this.value);
  });
  document.getElementById('frontRightKneeSlide').addEventListener('input', function() {
    if (!g_animateAll) g_frontRightKneeManual = parseFloat(this.value);
  });
  document.getElementById('frontRightAnkleSlide').addEventListener('input', function() {
    if (!g_animateAll) g_frontRightAnkleManual = parseFloat(this.value);
  });
  document.getElementById('innerAngleSlider').addEventListener('input', function() {
    g_innerAngle = parseFloat(this.value);
    document.getElementById('innerAngleVal').innerHTML = g_innerAngle + '°';
    renderAllShapes();
  });
  document.getElementById('outerAngleSlider').addEventListener('input', function() {
    g_outerAngle = parseFloat(this.value);
    document.getElementById('outerAngleVal').innerHTML = g_outerAngle + '°';
    renderAllShapes();
  });
 canvas.onmousemove = function(ev) {if (ev.buttons == 1) {click(ev)}};
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  g_camera = new Camera();
  document.onkeydown = keydown;
  setupMouseControls();
  initTextures(gl);
  g_model = new Model('benchy.obj');
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

var g_lightOn = true;
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
  gl.uniform3f(u_cameraPos, g_camera.eye.components[0], g_camera.eye.components[1], g_camera.eye.components[2]);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightDirection, 0, -1, 0);
  gl.uniform1f(u_innerLimit, Math.cos(g_innerAngle * Math.PI / 180));
  gl.uniform1f(u_outerLimit, Math.cos(g_outerAngle * Math.PI / 180));
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform1i(u_lightOn, g_lightOn);

  var light = new Cube([1,1,0]);
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.textureNum = -2;
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();
    
  
  //sky
  var sky = new Cube([0.5, 0.7, 1.0, 1.0]);
  sky.textureNum = -2;
  if (g_normalOn) {
    sky.textureNum = -3;
  }
  sky.matrix.scale(-7.0, -7.0, -7.0);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderNorms();


  //floor
  var floor = new Cube([0.0, 1.0, 0.0, 1.0]);
  floor.textureNum = g_textures.grass;
  if (g_normalOn) {
    floor.textureNum = -3;
  }
  floor.matrix.scale(10, 0.01, 10);
  floor.matrix.translate(-.5, -30.0, -.5);
  floor.renderNorms();


//sphere
  var ball = new Sphere([1.0, 0.0, 0.0, 1.0]);
  ball.textureNum = g_textures.grass;            // -2 = flat color, 0/1/2 = texture
  if (g_normalOn) { ball.textureNum = -3; }
  ball.matrix.scale(0.3, 0.3, 0.3);
  ball.renderFull();

  // Blocky animal
  drawAnimal();

  // benchy model
  if (g_model) {
    g_model.textureNum = g_normalOn ? -3 : -2;
    g_model.color = [0.8, 0.6, 0.4, 1.0];
    g_model.matrix = new Matrix4();
    g_model.matrix.translate(1, -0.3, 0);
    g_model.matrix.scale(.10, .1, .1);
    g_model.render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + "fps:  " + Math.floor(10000/duration), "numdot");
}

function drawAnimal() {
  var tn = g_normalOn ? -3 : -2;

  var body = new Cube([0.5, 0.35, 0.05, 1.0]);
  body.textureNum = tn;
  body.matrix.setTranslate(-1.5, 0.3, 0.0);
  body.matrix.scale(1.0, 0.5, 0.6);
  var B = new Matrix4(body.matrix); // body coordinate origin
  body.matrix.translate(-.5, -.3, -.4);
  body.renderNorms();

  var head = new Cube([0.4, 0.3, 0.2, 1.0]);
  head.textureNum = tn;
  head.matrix = new Matrix4(B);
  head.matrix.translate(0.5, 0.3, -0.1);
  head.matrix.scale(0.5, 0.6, 0.5);
  head.renderNorms();

  var rightHorn = new Cone([0.96, 0.87, 0.70, 1.0]);
  rightHorn.textureNum = tn;
  rightHorn.matrix = new Matrix4(B);
  rightHorn.matrix.translate(0.7, 0.91, 0.0);
  rightHorn.matrix.scale(0.15, 0.3, 0.15);
  rightHorn.renderNorms();

  var leftHorn = new Cone([0.96, 0.87, 0.70, 1.0]);
  leftHorn.textureNum = tn;
  leftHorn.matrix = new Matrix4(B);
  leftHorn.matrix.translate(0.7, 0.91, 0.3);
  leftHorn.matrix.scale(0.15, 0.3, 0.15);
  leftHorn.renderNorms();

  var tail = new Cube([0.3, 0.2, 0.1, 1.0]);
  tail.textureNum = tn;
  tail.matrix = new Matrix4(B);
  tail.matrix.translate(-.75, 0.0, 0.0);
  tail.matrix.rotate(-30 + 15 * Math.sin(g_seconds * 3), 0, 0, 1);
  tail.matrix.scale(0.15, 0.5, 0.15);
  tail.renderNorms();

  function makeLeg(tx, ty, tz, hip, knee, ankle) {
    var h = new Cube([0.6, 0.4, 0.2, 1.0]); h.textureNum = tn;
    h.matrix = new Matrix4(B);
    h.matrix.translate(tx, ty, tz);
    h.matrix.rotate(hip, 0, 0, 1);
    var hMat = new Matrix4(h.matrix);
    h.matrix.scale(0.2, 0.2, 0.2); h.matrix.translate(-0.5, 0, 0);
    h.renderNorms();

    var t = new Cube([0.6, 0.4, 0.2, 1.0]); t.textureNum = tn;
    t.matrix = hMat;
    t.matrix.translate(0.0, -0.2, 0.0);
    t.matrix.rotate(-knee, 0, 0, 1);
    var kMat = new Matrix4(t.matrix);
    t.matrix.scale(0.15, 0.5, 0.15); t.matrix.translate(-0.5, -0.3, 0.0);
    t.renderNorms();

    var f = new Cube([0.2, 0.2, 0.2, 1.0]); f.textureNum = tn;
    f.matrix = kMat;
    f.matrix.translate(0.0, -0.4, 0.0);
    f.matrix.rotate(ankle, 0, 0, 1);
    f.matrix.scale(0.18, 0.25, 0.18); f.matrix.translate(-0.5, 0.0, 0.0);
    f.renderNorms();
  }

  makeLeg( 0.3, -0.5,  0.3, g_frontLeftHip,  g_frontLeftKnee,  g_frontLeftAnkle);
  makeLeg( 0.3, -0.5, -0.3, g_frontRightHip, g_frontRightKnee, g_frontRightAnkle);
  makeLeg(-0.3, -0.5,  0.3, g_backLeftHip,   g_backLeftKnee,   g_backLeftAnkle);
  makeLeg(-0.3, -0.5, -0.3, g_backRightHip,  g_backRightKnee,  g_backRightAnkle);
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
  g_lightPos[0] = Math.cos(g_seconds);

  if (g_animateAll) {
    let w = g_seconds * 1.5;
    g_frontLeftHip   =  35 * Math.sin(w);           g_frontLeftKnee   = -25 * Math.sin(w + Math.PI);      g_frontLeftAnkle   = -15 * Math.sin(w + Math.PI/2);
    g_backRightHip   =  35 * Math.sin(w);            g_backRightKnee   =  25 * Math.sin(w + Math.PI);      g_backRightAnkle   = -15 * Math.sin(w + Math.PI/2);
    g_frontRightHip  =  35 * Math.sin(w + Math.PI);  g_frontRightKnee  = -25 * Math.sin(w);                g_frontRightAnkle  = -15 * Math.sin(w + 3*Math.PI/2);
    g_backLeftHip    =  35 * Math.sin(w + Math.PI);  g_backLeftKnee    =  25 * Math.sin(w);                g_backLeftAnkle    = -15 * Math.sin(w + 3*Math.PI/2);
  } else {
    g_frontRightHip = g_frontRightHipManual; g_frontRightKnee = g_frontRightKneeManual; g_frontRightAnkle = g_frontRightAnkleManual;
    g_frontLeftHip = 0;  g_frontLeftKnee = 0;  g_frontLeftAnkle = 0;
    g_backLeftHip  = 0;  g_backLeftKnee  = 0;  g_backLeftAnkle  = 0;
    g_backRightHip = 0;  g_backRightKnee = 0;  g_backRightAnkle = 0;
  }

  if (g_animateMagenta) g_frontRightHip   =  45 * Math.sin(3 * g_seconds);
  if (g_animateYellow)  g_frontRightKnee  = -45 * Math.sin(3 * g_seconds);
  if (g_animateRed)     g_frontRightAnkle = -45 * Math.sin(3 * g_seconds);

  if (g_pokeAnimation) {
    let t = g_seconds - g_pokeStartTime;
    if (t < 1.5) {
      let j = Math.sin(t * 4) * Math.exp(-t * 2);
      g_frontLeftHip = g_frontRightHip = g_backLeftHip = g_backRightHip = 60 * j;
      g_frontLeftKnee = g_frontRightKnee = -40 * j;
      g_backLeftKnee  = g_backRightKnee  =  40 * j;
    } else {
      g_pokeAnimation = false;
    }
  }
}

