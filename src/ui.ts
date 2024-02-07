import { RobotController } from "./robot";
import VisualSimulation from "./robot/visual-simulation";
import WebCommandProcessor from "./commands/web-command-processor";

const robot = new VisualSimulation();
const width = 5;
const depth = 5;

document.getElementById("x")!.setAttribute("max", width.toString());
document.getElementById("y")!.setAttribute("max", depth.toString());

robot
  .init(document.getElementById("robot") as HTMLDivElement, width, depth)
  .then(() => {
    const controller = new RobotController(width, depth, robot);
    const processor = new WebCommandProcessor();
    processor.readCommands(controller);
  });
