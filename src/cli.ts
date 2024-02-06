import { Robot, RobotController } from "./robot";

function main() {
  const robot = new Robot();
  const controller = new RobotController(5, 5, robot);

  console.info("==== Robot Simulator ====");
  console.info("Commands: `PLACE X,Y,F`, MOVE, LEFT, RIGHT, REPORT");

  readCommands(controller);
}

function readCommands(controller: RobotController) {
  const stdin = process.openStdin();
  stdin.addListener("data", function (d) {
    try {
      const input = d.toString().trim();
      processCommand(input, controller);
    } catch (err) {
      console.error((err as Error).message || "An error occurred");
    }
  });
}

function processCommand(input: string, controller: RobotController) {
  switch (input) {
    case "MOVE":
      controller.move();
      break;
    case "LEFT":
      controller.rotateLeft();
      break;
    case "RIGHT":
      controller.rotateRight();
      break;
    case "REPORT":
      console.info(`Output: ${controller.report()}`);
      break;
    case "EXIT":
      process.exit();
    default:
      const [command, x, y, facing] = input.split(/[\s,]+/);
      if (command === "PLACE") {
        controller.placeRobot(Number(x), Number(y), facing as any);
      } else {
        console.warn("Invalid command");
      }
  }
}

main();
