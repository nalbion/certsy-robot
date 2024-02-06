import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import Robot from "./robot";

export default class VisualSimulation implements Robot {
  private robotPlaced = false;

  private scene?: THREE.Scene;
  private robot?: THREE.Object3D;
  private clock = new THREE.Clock();

  constructor() {}

  setPosition(x: number, y: number) {
    // Note: x/y are not as user would expect
    this.robot!.position.set(y, 0, x);

    if (!this.robotPlaced) {
      this.robotPlaced = true;
      this.scene!.add(this.robot!);
    }
  }

  setHeading(heading: number) {
    this.robot!.rotation.y = heading;
  }

  async move() {
    const x = this.robot!.position.x;
    const y = this.robot!.position.z;

    let newX = x;
    let newY = y;

    switch (this.robot!.rotation.y) {
      case 0:
        newY++;
        break;
      case Math.PI / 2:
        newX++;
        break;
      case Math.PI:
        newY--;
        break;
      case (3 * Math.PI) / 2:
        newX--;
        break;
    }

    this.robot?.position.set(newX, 0, newY);
  }

  async rotateLeft() {
    this.robot!.rotation.y = (this.robot!.rotation.y + Math.PI / 2) % (2 * Math.PI);
  }

  async rotateRight() {
    this.robot!.rotation.y = (this.robot!.rotation.y - Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
  }

  async init(hostElement: HTMLDivElement) {
    const scene = await this.createScene();
    this.scene = scene;
    this.createLighting(scene);
    const camera = this.createCamera();
    const renderer = this.createRenderer(camera, hostElement);

    this.createTable(scene);
    this.robot = await this.createRobot();

    // Run the animation
    const animate = () => {
      requestAnimationFrame(animate);

      //   robot.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();
  }

  private async createScene(): Promise<THREE.Scene> {
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

  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-2, 1.5, -2);
    camera.lookAt(2.5, 0.5, 2.5);
    return camera;
  }

  private createRenderer(camera: THREE.PerspectiveCamera, hostElement: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(hostElement.clientWidth, hostElement.clientHeight);
    hostElement.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
      const width = window.innerWidth - 100;
      camera.aspect = width / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(width, window.innerHeight);
    });

    return renderer;
  }

  private createTable(scene: THREE.Scene): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(5, 1, 5);
    const material = new THREE.MeshLambertMaterial({ color: THREE.Color.NAMES.saddlebrown });
    const table = new THREE.Mesh(geometry, material);
    table.receiveShadow = true;
    table.position.set(2.5, -0.5, 2.5);
    scene.add(table);
    return table;
  }

  private async createRobot() {
    const loader = new GLTFLoader();
    let robot;

    try {
      const gltf = await loader.loadAsync("phillip_robot/scene.gltf");
      robot = gltf.scene;
      const mesh = gltf.scene.children[0] as THREE.Mesh;
      mesh.castShadow = true;
      mesh.scale.set(0.5, 0.5, 0.5);

      robot.traverse(function (object) {
        if ((object as THREE.Mesh).isMesh) (object as THREE.Mesh).castShadow = true;
      });

      // Adjust the robot insertion position so that it pivots on the wheel
      robot.position.z = 0.3;
      const pivot = new THREE.Object3D();
      pivot.add(robot);
      robot = pivot;
    } catch (err) {
      console.error("Error loading model:", err);
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      robot = new THREE.Mesh(geometry, material);
    }

    return robot;
  }

  private createLighting(scene: THREE.Scene) {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(2.5, 20, 2.5);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(2.5, 10, -10);
    dirLight.castShadow = true;

    scene.add(dirLight);
  }
}
