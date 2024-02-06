import RobotController, { FacingDirection } from "./robot-controller";
import VisualSimulation from "./visual-simulation";

const robot = new VisualSimulation();
robot.init(document.getElementById("robot") as HTMLDivElement).then(() => {
  document.getElementById("place")!.removeAttribute("disabled");
  document.getElementById("move")!.removeAttribute("disabled");
  document.getElementById("left")!.removeAttribute("disabled");
  document.getElementById("right")!.removeAttribute("disabled");
  document.getElementById("report")!.removeAttribute("disabled");
});

const controller = new RobotController(5, 5, robot);

function report() {
  const output = controller.report();
  document.getElementById("output")!.textContent = output;
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      controller.move();
      break;
    case "ArrowLeft":
      controller.rotateLeft();
      break;
    case "ArrowRight":
      controller.rotateRight();
      break;
    case " ":
      report();
  }
});

document.getElementById("place")?.addEventListener("click", () => {
  const x = Number((document.getElementById("x") as HTMLInputElement).value);
  const y = Number((document.getElementById("y") as HTMLInputElement).value);
  const facing = (document.getElementById("facing") as HTMLInputElement).value as FacingDirection;

  controller.placeRobot(x, y, facing);
});

document.getElementById("move")?.addEventListener("click", () => {
  controller.move();
});

document.getElementById("left")?.addEventListener("click", () => {
  controller.rotateLeft();
});

document.getElementById("right")?.addEventListener("click", () => {
  controller.rotateRight();
});

document.getElementById("report")?.addEventListener("click", report);
