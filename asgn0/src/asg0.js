// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);// Fill a rectangle with the color
  var vector1 = new Vector3([2.25, 2.25, 0.0]);
  drawVector(vector1, "red");
}

function handleDrawEvent(){
  clearCanvas();
  let x = document.getElementById("v1x").value;
  let y = document.getElementById("v1y").value;
  let v1 = new Vector3([parseFloat(x), parseFloat(y), 0.0]);
  drawVector(v1, "red");

  let x2 = document.getElementById("v2x").value;
  let y2 = document.getElementById("v2y").value;
  let v2 = new Vector3([parseFloat(x2), parseFloat(y2), 0.0]);
  drawVector(v2, "blue");
  console.log(x);
}

function drawVector(v, color){
var canvas = document.getElementById('example');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var ctx = canvas.getContext('2d');
ctx.strokeStyle = color;
ctx.beginPath();
ctx.moveTo(centerX, centerY);
ctx.lineTo(centerX + v.elements[0] * 20, centerY - v.elements[1] * 20);
ctx.stroke();
}

function clearCanvas() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawOperationEvent(){
  clearCanvas();
  let x1 = document.getElementById("v1x").value;
  let y1 = document.getElementById("v1y").value;
  let v1 = new Vector3([parseFloat(x1), parseFloat(y1), 0.0]);
  drawVector(v1, "red");

  let x2 = document.getElementById("v2x").value;
  let y2 = document.getElementById("v2y").value;
  let v2 = new Vector3([parseFloat(x2), parseFloat(y2), 0.0]);
  drawVector(v2, "blue");

  let operation = document.getElementById("operation").value;
  if (operation === "add"){
    let result = v1.add(v2);
    drawVector(result, "green");
  }
  else if (operation === "subtract"){
    let result = v1.sub(v2);
    drawVector(result, "green");
  }
  else if (operation === "multiply"){
    let scalar = document.getElementById("scalar").value;
    let result1 = v1.mul(scalar);
    drawVector(result1, "green");
    let result2 = v2.mul(scalar);
    drawVector(result2, "green");
  }
  else if (operation === "divide"){
    let scalar = document.getElementById("scalar").value;
    let result1 = v1.div(scalar);
    drawVector(result1, "green");
    let result2 = v2.div(scalar);
    drawVector(result2, "green");
  }
  else if (operation === "magnitude"){
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    console.log("Magnitude of Vector 1: " + mag1);
    console.log("Magnitude of Vector 2: " + mag2);
  }
  else if (operation === "normalize"){
    let norm1 = v1.normalize();
    drawVector(norm1, "green");
    let norm2 = v2.normalize();
    drawVector(norm2, "green");
  }
  else if (operation === "Angle between"){
    let dot = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    let angle = Math.acos(dot / (mag1 * mag2));
    let angleDegrees = angle * (180 / Math.PI);
    console.log("Angle between vectors: " + angleDegrees + " degrees");
  }
  else if (operation === "Area"){
    let area = areaTriangle(v1, v2);
    console.log("Area of triangle: " + area);
  }
}

function areaTriangle(v1, v2){
  let cross = Vector3.cross(v1, v2);
  let area = 0.5 * cross.magnitude();
  return area;
}