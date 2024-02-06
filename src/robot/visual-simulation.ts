import * as THREE from "three";

import Robot from "./robot";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

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
    let value = t >= this.duration ? this.finalValue : easeOutBack(t, this.beginning, this.change, this.duration);
    this.onUpdate(value);
  }
}

/**
 * @see http://localhost:5173/
 */
export default class VisualSimulation extends Robot {
  private robotPlaced = false;
  private scene?: THREE.Scene;
  private robot?: THREE.Object3D;
  private commandQueue: Array<Function> = [];
  private animation?: Animation;
  private clock = new THREE.Clock();

  override setPosition(x: number, y: number) {
    // Note: x/y are not as user would expect
    this.robot!.position.set(y, 0, x);

    if (!this.robotPlaced) {
      this.robotPlaced = true;
      this.scene!.add(this.robot!);
    }
  }

  override setHeading(heading: number) {
    this.robot!.rotation.y = heading;
  }

  override async move() {
    this.commandQueue.push(() => {
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

      if (x !== newX) {
        this.createAnimation(x, newX - x, newX, 1, (value) => {
          this.robot!.position.x = value;
        });
      } else {
        this.createAnimation(z, newZ - z, newZ, 1, (value) => {
          this.robot!.position.z = value;
        });
      }
    });
  }

  override async rotateLeft() {
    this.commandQueue.push(() => {
      const delta = Math.PI / 2;
      const finalValue = (this.robot!.rotation.y + delta) % (2 * Math.PI);
      this.createAnimation(this.robot!.rotation.y, delta, finalValue, 1, (value) => {
        this.robot!.rotation.y = value;
      });
    });
  }

  override async rotateRight() {
    this.commandQueue.push(() => {
      const delta = -Math.PI / 2;
      const finalValue = (this.robot!.rotation.y + delta + 2 * Math.PI) % (2 * Math.PI);
      this.createAnimation(this.robot!.rotation.y, delta, finalValue, 1, (value) => {
        this.robot!.rotation.y = value;
      });
    });
  }

  async init(hostElement: HTMLDivElement, width: number, depth: number) {
    const scene = await this.createScene();
    this.scene = scene;
    this.createLighting(scene, width, depth);
    const camera = this.createCamera(width, depth);
    const renderer = this.createRenderer(camera, hostElement);

    this.createTable(scene, width, depth);
    this.robot = await this.createRobot();

    // Run the animation
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = this.clock.getElapsedTime();

      if (!this.animation && this.commandQueue.length > 0) {
        // Dequeue an action and execute it
        let command = this.commandQueue.shift();
        command!();
      }

      if (this.animation) {
        if (this.animation.isFinished(elapsedTime)) {
          this.animation.onUpdate(this.animation.finalValue);
          this.animation = undefined;
        } else {
          this.animation.update(elapsedTime);
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
    this.animation = new Animation(startValue, change, finalValue, duration, onUpdate);
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

  private createCamera(width: number, depth: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-Math.sqrt(depth), 1.5, -Math.sqrt(width));
    camera.lookAt(depth / 2, 0.5, width / 2);
    return camera;
  }

  private createRenderer(camera: THREE.PerspectiveCamera, hostElement: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    const deltaWidth = window.innerWidth - hostElement.clientWidth;
    renderer.setSize(hostElement.clientWidth, hostElement.clientHeight);
    hostElement.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
      const width = window.innerWidth - deltaWidth;
      camera.aspect = width / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(width, window.innerHeight);
    });

    return renderer;
  }

  private createTable(scene: THREE.Scene, width: number, depth: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(depth, 1, width);
    const material = new THREE.MeshLambertMaterial({ color: THREE.Color.NAMES.saddlebrown });
    const table = new THREE.Mesh(geometry, material);
    table.receiveShadow = true;
    table.position.set(depth / 2, -0.5, width / 2);
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
        if ((object as THREE.Mesh).isMesh) {
          (object as THREE.Mesh).castShadow = true;
        }
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

  private createLighting(scene: THREE.Scene, width: number, depth: number) {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(depth / 2, 20, width / 2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(depth / 2, 10, -(width + 5));
    dirLight.castShadow = true;
    scene.add(dirLight);
  }
}
