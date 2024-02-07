import { CommandProcessor } from "./commands";
import { Robot, RobotController } from "./robot";

function main() {
  const robot = new Robot();
  const controller = new RobotController(5, 5, robot);
  const commandProcessor = new CommandProcessor();

  console.info("==== Robot Simulator ====");
  console.info("Commands: ", commandProcessor.listCommands().join(", "));

  commandProcessor.readCommands(controller);
}

main();
