import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

function main() {
  const canvas = document.querySelector('#c');

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(40, 25, 70);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0xaabbcc, 0.002);
  
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);         
  controls.maxPolarAngle = Math.PI / 2; 
  controls.update();                    

  const ambientLight = new THREE.AmbientLight(0x334466, 0.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff5cc, 2);
  sunLight.position.set(30, 80, 40);
  sunLight.castShadow = true;


  sunLight.shadow.mapSize.set(2048, 2048); // higher = sharper shadows, more GPU cost
  sunLight.shadow.camera.left   = -100;
  sunLight.shadow.camera.right  = 100;
  sunLight.shadow.camera.top    = 100;
  sunLight.shadow.camera.bottom = -100;
  sunLight.shadow.camera.far    = 300;
  scene.add(sunLight);


  const hemiLight = new THREE.HemisphereLight(0x88aacc, 0x445544, 0.5);
  scene.add(hemiLight);

  const lampLights = [];

  const spotLight = new THREE.SpotLight(0xffffff, 3, 60, Math.PI / 10, 0.5);
  spotLight.position.set(0, 30, 0); 
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
  scene.add(spotLight.target); 


  const texLoader = new THREE.TextureLoader();
  const skyscraperTex = texLoader.load('resources/textures/skyscraper.jpg');
  skyscraperTex.colorSpace = THREE.SRGBColorSpace;

  skyscraperTex.wrapS = skyscraperTex.wrapT = THREE.RepeatWrapping;

  const daylightTex = texLoader.load('resources/textures/daylight.jpg');
  daylightTex.colorSpace = THREE.SRGBColorSpace;

  const sunsetTex = texLoader.load('resources/textures/sunset.png');
  sunsetTex.colorSpace = THREE.SRGBColorSpace;


  const skyMat = new THREE.MeshBasicMaterial({ map: daylightTex, side: THREE.BackSide });
  const skySphere = new THREE.Mesh(new THREE.BoxGeometry(600, 600, 600), skyMat);
  scene.add(skySphere);

  let currentSkyIsDay = true;

  function mat(color, extras = {}) {
    return new THREE.MeshStandardMaterial({ color, ...extras });
  }


  function addBox(w, h, d, material, x, y, z, ry = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y + h / 2, z); // offset by h/2 so base is at y
    mesh.rotation.y = ry;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }


  function addSphere(r, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
  }


  function addCylinder(rt, rb, h, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 12), material);
    mesh.position.set(x, y + h / 2, z); // sit the base on y
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function addCone(r, h, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), material);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
  }


  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    mat(0x2d3d2d) // dark grey-green: city block ground
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);


  const POND_W  = 15;  // width (X axis)
  const POND_L  = 120; // length (Z axis) — ¾ of the 160-unit street
  const POND_X  = -33; // center X: just outside the left-side buildings (~x = −22)
  const POND_Z  = 0;   // center Z: middle of the street length

  const pond = new Reflector(
    new THREE.PlaneGeometry(POND_W, POND_L),
    {
      clipBias: 0.003,
      textureWidth:  window.innerWidth  * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x7799aa, // blue-grey water tint blended over the reflection
    }
  );
  // Rotate flat (Reflector faces +Y by default when rotated −90° on X).
  pond.rotation.x = -Math.PI / 2;
  // y = 0.04 raises it just above the ground to prevent z-fighting.
  pond.position.set(POND_X, 0.04, POND_Z);
  scene.add(pond);


  const rimMat = mat(0x888877); // light grey stone
  const rimH = 0.4;             // rim height
  const rimT = 0.6;             // rim thickness
  const hw = POND_W / 2;        // half-width
  const hl = POND_L / 2;        // half-length

  // Near / far edges run along X (width direction)
  addBox(POND_W + rimT * 2, rimH, rimT, rimMat, POND_X, 0, POND_Z - hl); // far  edge
  addBox(POND_W + rimT * 2, rimH, rimT, rimMat, POND_X, 0, POND_Z + hl); // near edge
  // Left / right edges run along Z (length direction)
  addBox(rimT, rimH, POND_L, rimMat, POND_X - hw, 0, POND_Z); // left  edge
  addBox(rimT, rimH, POND_L, rimMat, POND_X + hw, 0, POND_Z); // right edge

  const POND_X2 = -POND_X; // +33, just outside the right-side buildings
  const pond2 = new Reflector(
    new THREE.PlaneGeometry(POND_W, POND_L),
    {
      clipBias: 0.003,
      textureWidth:  window.innerWidth  * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x7799aa,
    }
  );
  pond2.rotation.x = -Math.PI / 2;
  pond2.position.set(POND_X2, 0.04, POND_Z);
  scene.add(pond2);

  // Stone rim for right pond — same math, mirrored X
  addBox(POND_W + rimT * 2, rimH, rimT, rimMat, POND_X2, 0, POND_Z - hl); // far  edge
  addBox(POND_W + rimT * 2, rimH, rimT, rimMat, POND_X2, 0, POND_Z + hl); // near edge
  addBox(rimT, rimH, POND_L, rimMat, POND_X2 - hw, 0, POND_Z); // left  edge
  addBox(rimT, rimH, POND_L, rimMat, POND_X2 + hw, 0, POND_Z); // right edge


  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 160),
    new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.95 }) // flat dark asphalt grey
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);


  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xa0a090, roughness: 0.9 }); // flat concrete grey

  const sidewalkL = new THREE.Mesh(new THREE.PlaneGeometry(5, 160), sidewalkMat);
  sidewalkL.rotation.x = -Math.PI / 2;
  sidewalkL.position.set(-8.5, 0.03, 0);
  sidewalkL.receiveShadow = true;
  scene.add(sidewalkL); // #3

  const sidewalkR = sidewalkL.clone();
  sidewalkR.position.set(8.5, 0.03, 0);
  scene.add(sidewalkR); // #4


  const dashMat = mat(0xffcc00); // yellow
  for (let i = 0; i < 8; i++) {
    const z = -52.5 + i * 15; // spreads dashes from z = −52.5 to z = +52.5

    addBox(0.25, 0.05, 6, dashMat, 0, 0, z); // #5–12
  }


  function addBuilding(w, h, d, x, z, colorShift = 0) {
    const shade = 0.36 + colorShift;

    const tex = skyscraperTex.clone();
    tex.needsUpdate = true; 

    tex.repeat.set(Math.round(w / 10) || 1, Math.round(h / 8));
    const buildMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: new THREE.Color(shade - 0.02, shade - 0.01, shade + 0.02),
      roughness: 0.75,
      metalness: 0.1,
    });
    return addBox(w, h, d, buildMat, x, 0, z);
  }

  // Left side buildings
  addBuilding(10, 45, 12, -17, -60,  0.00); // #13
  addBuilding(12, 30, 10, -18, -30,  0.04); // #14
  addBuilding(8,  60, 10, -15,   0,  0.02); // #15 — tallest building (landmark)
  addBuilding(11, 38, 12, -18,  30,  0.06); // #16
  addBuilding(10, 25, 10, -16,  60, -0.02); // #17

  // Right side buildings
  addBuilding(10, 50, 11,  17, -45,  0.03); // #18
  addBuilding(12, 35, 10,  18, -15,  0.01); // #19
  addBuilding(9,  55, 12,  16,  15,  0.05); // #20 — second tallest
  addBuilding(11, 28, 10,  18,  45, -0.01); // #21
  addBuilding(10, 42, 11,  17,  75,  0.04); // #22

  // Rooftop spires — addCone(radius, height, material, x, y, z)

  const spireMat = mat(0x556677, { metalness: 0.6, roughness: 0.3 }); // steel-blue metal
  addCone(1.2, 12, spireMat, -15, 60,  0);  // spire on building #15 (y=60 = its roof height)
  addCone(1.0, 10, spireMat,  16, 55, 15);  // spire on building #20 (y=55 = its roof height)


  const poleMat = mat(0x333344); // dark grey steel

  const lampHeadMat = mat(0xffffee, { emissive: 0xffaa44, emissiveIntensity: 0.5 });

  const lampZ = [-50, -25, 0, 25, 50]; // z positions for lamp posts

  lampZ.forEach((z) => {
    [-9, 9].forEach((x) => { // left (−9) and right (+9) sidewalk edges
      addCylinder(0.12, 0.15, 9, poleMat, x, 0, z);       // pole — slightly tapered
      addBox(0.8, 0.4, 0.8, lampHeadMat, x, 9, z);        // lamp head box at pole top

      const pl = new THREE.PointLight(0xffcc77, 0, 20);
      pl.position.set(x, 9.5, z);
      scene.add(pl);
      lampLights.push(pl); // stored for day/night cycle control
    });
  });

  const trunkMat   = mat(0x3d2010); // dark brown trunk
  const leafMat    = mat(0x2a5c1a); // forest green (shared by both types)
  const pineLeafMat = mat(0x1a4a10); // darker green for pine cones

  // Each entry: [z position, canopy type]
  const treeDefs = [
    { z: -37, type: 'sphere' }, // deciduous
    { z: -12, type: 'cone'   }, // pine
    { z:  12, type: 'sphere' }, // deciduous
    { z:  37, type: 'cone'   }, // pine
  ];

  treeDefs.forEach(({ z, type }) => {
    [-9, 9].forEach((x) => {
      addCylinder(0.2, 0.3, 4, trunkMat, x, 0, z); // trunk: slightly wider at base

      if (type === 'sphere') {
        addSphere(1.8, leafMat, x, 5.5, z);
      } else {

        addCone(2.0, 4.5, pineLeafMat, x, 3.5, z); // lower, wide base
        addCone(1.3, 3.5, pineLeafMat, x, 6.0, z); // upper, narrower tip
      }
    });
  });


  const STREET_START = -80;
  const STREET_END   =  80;

  function makePlaceholderCar(bodyColor) {
    const group = new THREE.Object3D();

    // Body — main low box
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1, 4.5),
      mat(bodyColor)
    );
    body.position.y = 0.5; // sit body 0.5 above group origin (which is ground level)
    body.castShadow = true;
    group.add(body);

    // Roof/cabin — smaller box on top of the body
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 2.5),
      mat(bodyColor)
    );
    roof.position.set(0, 1.4, 0.3);
    roof.castShadow = true;
    group.add(roof);

    const wheelMat = mat(0x111111);
    [[-1, -1.5], [-1, 1.5], [1, -1.5], [1, 1.5]].forEach(([dx, dz]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12),
        wheelMat
      );
      wheel.rotation.z = Math.PI / 2; // tip the cylinder on its side
      wheel.position.set(dx * 1.2, 0.35, dz);
      wheel.castShadow = true;
      group.add(wheel);
    });

    return group;
  }

  const carA = makePlaceholderCar(0xeecc22);
  carA.position.set(3, 0, STREET_START);
  scene.add(carA);

  const carB = makePlaceholderCar(0x223388);
  carB.position.set(-3, 0, STREET_END);
  carB.rotation.y = Math.PI; 
  scene.add(carB);


  let carARef = carA;
  let carBRef = carB;

  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    'resources/models/Toyota.glb',
    (gltf) => {
      scene.remove(carA);
      const realCar = gltf.scene;
      realCar.scale.set(.5, .5, .5);
      realCar.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });
      realCar.position.set(3, 0, STREET_START);
      scene.add(realCar);
      carARef = realCar;
    },
    undefined,
    () => {}
  );

  gltfLoader.load(
    'resources/models/Toyota.glb',
    (gltf) => {
      scene.remove(carB);
      const realCar = gltf.scene;
      realCar.scale.set(.5, .5, .5);
      realCar.rotation.y = Math.PI; 
      realCar.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });
      realCar.position.set(-3, 0, STREET_END);
      scene.add(realCar);
      carBRef = realCar;
    },
    undefined,
    () => {}
  );

  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(4, 16, 12), 
    new THREE.MeshBasicMaterial({ color: 0xfff5cc }) 
  );
  scene.add(sunSphere);

  let sunAngle = Math.PI / 3; 

  let lastTime = 0;

  function render(time) {
    time *= 0.001; // ms → seconds
    const dt = time - lastTime;
    lastTime = time;

    sunAngle += dt * 0.06; // full orbit ≈ 105 seconds

    sunLight.position.set(
      Math.cos(sunAngle) * 80,  // X: sweeps left and right
      Math.sin(sunAngle) * 80,  // Y: rises and sets
      40                         // Z: slight offset so shadows fall at an angle
    );

    const dayFactor = Math.max(0, Math.sin(sunAngle));

    sunSphere.position.copy(sunLight.position);

    sunSphere.visible = Math.sin(sunAngle) > -0.1;

    sunSphere.material.color.set(dayFactor > 0.25 ? 0xfff5cc : 0xff6622);

    sunLight.color.set(dayFactor > 0.25 ? 0xfff5cc : 0xff5500);
    sunLight.intensity = dayFactor * 2.2 + 0.05;

    ambientLight.intensity = 0.15 + dayFactor * 0.7;
    hemiLight.intensity    = 0.1  + dayFactor * 0.6;

    const lampBrightness = Math.max(0, 1 - dayFactor) * 3 + (dayFactor < 0.3 ? 1 : 0);
    lampLights.forEach(l => { l.intensity = lampBrightness; });

    lampHeadMat.emissiveIntensity = lampBrightness > 0.5 ? 1.5 : 0.3;

    const wantDay = dayFactor > 0.05;
    if (wantDay !== currentSkyIsDay) {
      skyMat.map = wantDay ? daylightTex : sunsetTex;
      skyMat.needsUpdate = true;
      currentSkyIsDay = wantDay;
    }

    const CAR_SPEED = 15; // units per second — increase to drive faster
    carARef.position.z += CAR_SPEED * dt;
    if (carARef.position.z > STREET_END) {
      carARef.position.z = STREET_START;
    }

    carBRef.position.z -= CAR_SPEED * dt;
    if (carBRef.position.z < STREET_START) {
      carBRef.position.z = STREET_END;
    }

    controls.update();             // OrbitControls requires an update call every frame
    renderer.render(scene, camera); // draw all scene objects to the canvas
    requestAnimationFrame(render);  // schedule this function to run again next frame
  }

  requestAnimationFrame(render); // kick off the loop
}

main();
