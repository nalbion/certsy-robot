import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import Robot from "./robot";

/**
 * Copied from https://spicyyoghurt.com/tools/easing-functions
 * @param t time - starts at 0
 * @param b beginning value
 * @param c change in value
 * @param d duration
 */
function easeOutBack(t: number, b: number, c: number, d: number) {
  const s = 1.70158;
  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

class Animation {
  startedAt?: number;

  constructor(
    private beginning: number,
    private change: number,
    public finalValue: number,
    private duration: number,
    public onUpdate: (value: number) => void
  ) {}

  isFinished(timestamp: number) {
    return this.startedAt && timestamp > this.startedAt + this.duration;
  }

  update(timestamp: number) {
    if (this.startedAt === undefined) {
      this.startedAt = timestamp;
    }

    const t = timestamp - this.startedAt;
    console.info(`update at ${timestamp}, t=${t}, duration=${this.duration}`);
    let value = t >= this.duration ? this.finalValue : easeOutBack(t, this.beginning, this.change, this.duration);
    this.onUpdate(value);
  }
}

export default class VisualSimulation implements Robot {
  private robotPlaced = false;

  private scene?: THREE.Scene;
  private robot?: THREE.Object3D;
  private animations: Animation[] = [];
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
    const z = this.robot!.position.z;

    let newX = x;
    let newZ = z;

    switch (this.robot!.rotation.y) {
      case 0:
        newZ++;
        break;
      case Math.PI / 2:
        newX++;
        break;
      case Math.PI:
        newZ--;
        break;
      case (3 * Math.PI) / 2:
        newX--;
        break;
    }

    console.info("move robot, facing:", this.robot!.rotation.y, "from:", x, z, "to:", newX, newZ);

    // this.robot?.position.set(newX, 0, newY);

    if (x !== newX) {
      this.createAnimation(x, newX - x, newX, 1, (value) => {
        this.robot!.position.x = value;
      });
    } else {
      this.createAnimation(z, newZ - z, newZ, 1, (value) => {
        this.robot!.position.z = value;
      });
    }
  }

  async rotateLeft() {
    const delta = Math.PI / 2;
    const finalValue = (this.robot!.rotation.y + delta) % (2 * Math.PI);
    this.createAnimation(this.robot!.rotation.y, delta, finalValue, 1, (value) => {
      this.robot!.rotation.y = value;
    });
  }

  async rotateRight() {
    const delta = -Math.PI / 2;
    const finalValue = (this.robot!.rotation.y + delta + 2 * Math.PI) % (2 * Math.PI);
    this.createAnimation(this.robot!.rotation.y, delta, finalValue, 1, (value) => {
      this.robot!.rotation.y = value;
    });

    // this.robot!.rotation.y = (this.robot!.rotation.y - Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
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

      const elapsedTime = this.clock.getElapsedTime();

      // Process animations
      for (let i = 0; i == 0 && i < this.animations.length; i++) {
        // If the animation is complete, remove it from the array
        if (this.animations[i].isFinished(elapsedTime)) {
          console.info("animation complete, set to final value", this.animations[i].finalValue);
          this.animations[i].onUpdate(this.animations[i].finalValue);
          this.animations.splice(i, 1);
          i--;
        } else {
          this.animations[i].update(elapsedTime);
        }
      }

      renderer.render(scene, camera);
    };

    animate();
  }

  private createAnimation(
    startValue: number,
    change: number,
    finalValue: number,
    duration: number,
    onUpdate: (value: number) => void
  ) {
    // this.animations.push({
    //   startTime: 0,
    //   beginning,
    //   change,
    //   duration,
    //   func: (timestamp: number) => {
    //     if (timestamp > )
    //     // this.robot!.rotation.y = easeInOutBack(timestamp, 0, 1, 1);
    //   },
    // });
    const animation = new Animation(startValue, change, finalValue, duration, onUpdate);
    // (value) => {
    // if (animation.isFinished(timestamp)) {
    //   this.animations.splice(this.animations.indexOf(animation), 1);
    // } else {
    //   animation.update(timestamp);
    //   func(timestamp);
    // }
    // });

    this.animations.push(animation);
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
      const width = window.innerWidth - 140;
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
