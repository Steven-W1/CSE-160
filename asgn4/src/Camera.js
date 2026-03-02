class Camera{
  constructor() {
    this.fov = 60;
    this.eye = new Vector(-.0, .2, 1.2);
    this.at = new Vector(-.0, 0.2, 0.2);
    this.up = new Vector(0, 1, 0);
    this.viewMatrix = new Matrix4();
    this.viewMatrix.setLookAt(this.eye[0], this.eye[1], this.eye[2], this.at[0], this.at[1], this.at[2], this.up[0], this.up[1], this.up[2]);
    this.projectionMatrix = new Matrix4();
    this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
     this.pitch = 0;
  }
  getForward2D() {
    var f = this.at.subtract(this.eye);
    var fx = f.components[0];
    var fz = f.components[2];
    var length = Math.sqrt(fx * fx + fz * fz);
    return {x: fx / length, z: fz / length};
  }

  // ✓ Get right direction (perpendicular to forward)
  getRight2D() {
    var forward = this.getForward2D();
    return {x: -forward.z, z: forward.x}; // Perpendicular in 2D
  }

  moveForward(amount = 0.4) {  // ✓ Match block size
    var f = this.at.subtract(this.eye);
    f = f.normalize();
    f = f.scale(amount);
    this.at = this.at.add(f);
    this.eye = this.eye.add(f);
  }

  moveBackward(amount = 0.4) {
    var f = this.eye.subtract(this.at);
    f = f.normalize();
    f = f.scale(amount);
    this.at = this.at.add(f);
    this.eye = this.eye.add(f);
  }

  moveLeft(amount = 0.4) {
 var f = this.at.subtract(this.eye);
    f = f.normalize();
    var s = f.cross(this.up);
    s = s.normalize();
    s = s.scale(amount);
    this.at = this.at.subtract(s);
    this.eye = this.eye.subtract(s);
  }

  moveRight(amount = 0.4) {
       var f = this.at.subtract(this.eye);
    f = f.normalize();
    var s = f.cross(this.up);
    s = s.normalize();
    s = s.scale(amount);
    this.at = this.at.add(s);
    this.eye = this.eye.add(s);
    
  }
    
panLeft(angle = 5) {
  // Get current forward direction
  var f = this.at.subtract(this.eye);
  var distance = f.magnitude(); // ✓ Store the distance (should be ~1.0)
  f = f.normalize();
  
  // Rotate around Y axis
  var rotMat = new Matrix4();
  rotMat.setRotate(angle, 0, 1, 0); // ✓ Just rotate around Y (up) axis
  
  var f_vec3 = new Vector3([f.components[0], f.components[1], f.components[2]]);
  var f_rotated_vec3 = rotMat.multiplyVector3(f_vec3);
  
  var f_rotated = new Vector(f_rotated_vec3.elements[0], f_rotated_vec3.elements[1], f_rotated_vec3.elements[2]);
  
  // ✓ Scale back to original distance and update at
  f_rotated = f_rotated.normalize().scale(distance);
  this.at = this.eye.add(f_rotated);
}

panRight(angle = 5) {
  this.panLeft(-angle);
}

panUp(angle = 5) {
    this.pitch += angle;
    // Clamp pitch to prevent camera flip
    this.pitch = Math.max(-89, Math.min(89, this.pitch));
    
    var f = this.at.subtract(this.eye);
    var distance = f.magnitude();
    
    // Get the right vector (perpendicular to forward and up)
    f = f.normalize();
    var right = f.cross(this.up);
    right = right.normalize();
    
    // Rotate around the right vector for pitch
    var rotMat = new Matrix4();
    rotMat.setRotate(angle, right.components[0], right.components[1], right.components[2]);
    
    var f_vec3 = new Vector3([f.components[0], f.components[1], f.components[2]]);
    var f_rotated_vec3 = rotMat.multiplyVector3(f_vec3);
    
    var f_rotated = new Vector(f_rotated_vec3.elements[0], f_rotated_vec3.elements[1], f_rotated_vec3.elements[2]);
    
    f_rotated = f_rotated.normalize().scale(distance);
    this.at = this.eye.add(f_rotated);
  }

  // ✓ NEW: Look down
  panDown(angle = 5) {
    this.panUp(-angle);
  }
}



