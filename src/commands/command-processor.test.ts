import { EventEmitter } from "events";
import { Robot } from "../robot";
import RobotController from "../robot/robot-controller";
import CommandProcessor from "./command-processor";

jest.mock("../robot/robot-controller", () => {
  return jest.fn().mockImplementation(() => {
    return {
      placeRobot: jest.fn(),
      move: jest.fn(),
      rotateLeft: jest.fn(),
      rotateRight: jest.fn(),
    };
  });
});

describe("CommandProcessor", () => {
  let controller: RobotController;
  let processor: CommandProcessor;
  let mockInput: EventEmitter;

  beforeEach(() => {
    controller = new RobotController(5, 5, new Robot());
    processor = new CommandProcessor();
    mockInput = new EventEmitter();
  });

  it("should list all commands", () => {
    // When
    const commands = processor.listCommands();

    // Then
    expect(commands).toEqual([
      "`PLACE X,Y,F`",
      "MOVE",
      "LEFT",
      "RIGHT",
      "REPORT",
      "EXIT",
    ]);
  });

  it("should call the action function for PLACE command", () => {
    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "PLACE 1,2,EAST");

    // Then
    expect(controller.placeRobot).toHaveBeenCalledWith(1, 2, "EAST");
  });

  it("should call the action function for MOVE command", () => {
    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "MOVE");

    // Then
    expect(controller.move).toHaveBeenCalled();
  });

  it("should call the action function for LEFT command", () => {
    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "LEFT");

    // Then
    expect(controller.rotateLeft).toHaveBeenCalled();
  });

  it("should call the action function for RIGHT command", () => {
    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "RIGHT");

    // Then
    expect(controller.rotateRight).toHaveBeenCalled();
  });

  it("should call the action function for REPORT command", () => {
    // Given
    const provideReport = jest.fn();
    (processor as any).commands.REPORT.action = provideReport;
    (processor as any).provideReport = provideReport;

    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "REPORT");

    // Then
    expect((processor as any).provideReport).toHaveBeenCalled();
  });

  it("should call the action function for EXIT command", () => {
    // Given
    const exit = jest.fn();
    (processor as any).commands.EXIT.action = exit;
    (processor as any).exit = exit;

    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "EXIT");

    // Then
    expect((processor as any).exit).toHaveBeenCalled();
  });

  it("should process multiple commands", () => {
    // Given
    const provideReport = jest.fn();
    (processor as any).commands.REPORT.action = provideReport;
    (processor as any).provideReport = provideReport;
    const exit = jest.fn();
    (processor as any).commands.EXIT.action = exit;
    (processor as any).exit = exit;

    // When
    processor.readCommands(controller, mockInput);
    mockInput.emit("data", "PLACE 1,2,SOUTH");
    mockInput.emit("data", "MOVE");
    mockInput.emit("data", "REPORT");
    mockInput.emit("data", "LEFT");
    mockInput.emit("data", "RIGHT");
    mockInput.emit("data", "REPORT");
    mockInput.emit("data", "EXIT");

    // Then
    expect(controller.placeRobot).toHaveBeenCalledWith(1, 2, "SOUTH");
    expect(controller.move).toHaveBeenCalled();
    expect(controller.rotateLeft).toHaveBeenCalled();
    expect(controller.rotateRight).toHaveBeenCalled();
    expect((processor as any).provideReport).toHaveBeenCalledTimes(2);
    expect((processor as any).exit).toHaveBeenCalled();
  });
});
