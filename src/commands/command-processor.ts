import { EventEmitter } from "events";
import { FacingDirection, RobotController } from "../robot";

type CommandDefinition = {
  name?: string;
  action: (controller: RobotController, args?: string[]) => void;
};

export default class CommandProcessor {
  private commands: { [name: string]: CommandDefinition } = {
    PLACE: {
      name: "`PLACE X,Y,F`",
      action: (controller: RobotController, args?: string[]) => {
        if (!args) {
          throw new Error("Missing arguments x, y, facing direction");
        }
        const [x, y, facing] = args;
        controller.placeRobot(Number(x), Number(y), facing as FacingDirection);
      },
    },
    MOVE: {
      action: (controller: RobotController) => controller.move(),
    },
    LEFT: {
      action: (controller: RobotController) => controller.rotateLeft(),
    },
    RIGHT: {
      action: (controller: RobotController) => controller.rotateRight(),
    },
    REPORT: {
      action: this.provideReport,
    },
    EXIT: {
      action: this.exit,
    },
  };

  listCommands(): string[] {
    return Object.keys(this.commands).map(
      (command) => this.commands[command].name || command,
    );
  }

  readCommands(
    controller: RobotController,
    input: EventEmitter = process.openStdin(),
  ) {
    input.on("data", (data) => {
      try {
        const command = data.toString().trim();
        this.processCommand(command, controller);
      } catch (err) {
        console.error((err as Error).message || "An error occurred");
      }
    });
  }

  protected processCommand(input: string, controller: RobotController) {
    let command = this.commands[input];
    let args: string | undefined;

    if (!command) {
      // Command with arguments - eg. PLACE 1,1,NORTH
      let commandName: string;
      [commandName, args] = input.split(" ");
      command = this.commands[commandName];
    }

    if (command) {
      command.action(controller, args?.split(","));
    } else {
      console.warn(`Invalid command: ${input}`);
    }
  }

  protected provideReport(controller: RobotController) {
    console.info(`Output: ${controller.report()}`);
  }

  protected exit() {
    process.exit();
  }
}
