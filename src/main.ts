import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, robot: THREE.Object3D;
let table: THREE.Mesh;
let renderer: THREE.WebGLRenderer;

const clock = new THREE.Clock();

async function init() {
  scene = await createScene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-2, 1.5, -2);
  camera.lookAt(2.5, 0.5, 2.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  const hostElement = document.getElementById("robot") as HTMLDivElement;
  renderer.setSize(hostElement.clientWidth, hostElement.clientHeight);
  hostElement.appendChild(renderer.domElement);

  table = createTable();
  robot = await createRobot();

  window.addEventListener("resize", () => {
    const width = window.innerWidth - 100;
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth - 100, window.innerHeight);
  });

  createLighting(scene);

  document.getElementById("move")?.addEventListener("click", () => {
    robot.position.x += 0.1;
  });
}

async function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);

  try {
    const envTexture = await new Promise<THREE.Texture>((resolve, reject) => {
      new THREE.TextureLoader().load("background.png", resolve, undefined, reject);
    });
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;
  } catch (err) {
    console.error("Error loading environment:", err);
  }

  return scene;
}

function createTable() {
  const geometry = new THREE.BoxGeometry(5, 1, 5);
  const material = new THREE.MeshLambertMaterial({ color: THREE.Color.NAMES.saddlebrown });
  table = new THREE.Mesh(geometry, material);
  table.receiveShadow = true;
  table.position.set(2.5, -0.5, 2.5);
  scene.add(table);
  return table;
}

async function createRobot() {
  const loader = new GLTFLoader();
  let robot;

  try {
    const gltf = await loader.loadAsync("phillip_robot/scene.gltf");
    robot = gltf.scene;
    const mesh = gltf.scene.children[0] as THREE.Mesh;
    mesh.castShadow = true;
    mesh.scale.set(0.5, 0.5, 0.5);

    robot.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });

    // Adjust the robot insertion position so that it pivots on the wheel
    robot.position.z = 0.3;

    const pivot = new THREE.Object3D();
    pivot.add(robot);
    robot = pivot;
    robot.position.set(2.5, 0, 2.5);
  } catch (err) {
    console.error("Error loading model:", err);
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    robot = new THREE.Mesh(geometry, material);
  }

  scene.add(robot);
  return robot;
}

function createLighting(scene: THREE.Scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(2.5, 20, 2.5);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(2.5, 10, -10);
  dirLight.castShadow = true;

  scene.add(dirLight);
}

function animate() {
  requestAnimationFrame(animate);

  robot.rotation.y += 0.01;

  renderer.render(scene, camera);
}

init().then(() => animate());
