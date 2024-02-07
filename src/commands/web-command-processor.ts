import CommandProcessor from "./command-processor";
import { RobotController } from "../robot";

export default class WebCommandProcessor extends CommandProcessor {
  override readCommands(controller: RobotController): void {
    for (const id of ["place", "move", "left", "right", "report"]) {
      // enable the control
      document.getElementById(id)!.removeAttribute("disabled");

      // register the event listener, using processCommand()
      document.getElementById(id)!.addEventListener("click", (e: MouseEvent) => {
        let command = (e.target as HTMLButtonElement).id.toUpperCase();
        command = this.addCommandArgs(command);

        this.processCommand(command, controller);
      });
    }

    const keyMapping = {
      ArrowUp: "MOVE",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      ArrowDown: "REPORT",
      " ": "PLACE",
      Escape: "EXIT",
    };

    window.addEventListener("keydown", (event) => {
      if (event.key in keyMapping) {
        const key = event.key as keyof typeof keyMapping;
        let command = keyMapping[key];
        command = this.addCommandArgs(command);
        this.processCommand(command, controller);
      }
    });
  }

  protected override provideReport(controller: RobotController): void {
    const output = controller.report();
    document.getElementById("output")!.textContent = output;
  }

  protected override exit(): void {
    if (confirm("Are you sure you want to exit?")) {
      window.close();
    }
  }

  private addCommandArgs(command: string) {
    if (command === "PLACE") {
      const x = (document.getElementById("x") as HTMLInputElement).value;
      const y = (document.getElementById("y") as HTMLInputElement).value;
      const facing = (document.getElementById("facing") as HTMLInputElement).value;
      command += ` ${x},${y},${facing}`;
    }
    return command;
  }
}
