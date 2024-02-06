import { RobotController, FacingDirection } from "./robot";
import VisualSimulation from "./robot/visual-simulation";

const robot = new VisualSimulation();
const width = 5;
const depth = 5;

document.getElementById("x")!.setAttribute("max", width.toString());
document.getElementById("y")!.setAttribute("max", depth.toString());

robot
  .init(document.getElementById("robot") as HTMLDivElement, width, depth)
  .then(() => {
    // Once initialised, enable the controls
    for (const id of ["place", "move", "left", "right", "report"]) {
      document.getElementById(id)!.removeAttribute("disabled");
    }
  });

const controller = new RobotController(width, depth, robot);

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
    case "ArrowDown":
      report();
  }
});

function addClickListener(id: string, handler: () => void) {
  document.getElementById(id)!.addEventListener("click", handler);
}

addClickListener("place", () => {
  const x = Number((document.getElementById("x") as HTMLInputElement).value);
  const y = Number((document.getElementById("y") as HTMLInputElement).value);
  const facing = (document.getElementById("facing") as HTMLInputElement).value as FacingDirection;

  controller.placeRobot(x, y, facing);
});

addClickListener("move", () => {
  controller.move();
});

addClickListener("left", () => {
  controller.rotateLeft();
});

addClickListener("right", () => {
  controller.rotateRight();
});

addClickListener("report", report);
