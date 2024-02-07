import Robot from "./robot";
import RobotController, { FacingDirection } from "./robot-controller";

let robot: Robot;
let controller: RobotController;

describe("RobotController", () => {
  beforeEach(() => {
    robot = new Robot();
    controller = new RobotController(5, 5, robot);
  });

  it("should not report if the robot has not been placed", () => {
    // Given not placed

    expect(controller.report()).toBe("Robot has not been placed");
  });

  it("should report the position and facing direction", () => {
    // Given
    controller.placeRobot(2, 2, "NORTH");

    // When
    const report = controller.report();

    // Then
    expect(report).toBe("2,2,NORTH");
  });

  it("should all report to be requested multiple times", async () => {
    // Given
    controller.placeRobot(2, 2, "NORTH");

    // When
    const report1 = controller.report();
    await controller.move();
    await controller.rotateRight();
    await controller.move();
    const report2 = controller.report();

    // Then
    expect(report1).toBe("2,2,NORTH");
    expect(report2).toBe("3,3,EAST");
  });

  it("should not allow placing the robot outside the table", () => {
    // Given
    const invalidPositions = [
      { x: -1, y: 1 },
      { x: 6, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 6 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 5 },
      { x: 5, y: 1 },
    ];

    invalidPositions.forEach(({ x, y }) => {
      expect(() => {
        // When
        controller.placeRobot(x, y, "NORTH");
      }).toThrow("Invalid position");
    });
  });

  it("should not allow placing the robot with an invalid facing direction", () => {
    // Given
    const invalidFacingDirections = ["NORT", "SOUT", "EASTT", "WESTT"];

    invalidFacingDirections.forEach((facing) => {
      expect(() => {
        // When
        controller.placeRobot(1, 1, facing as any);
      }).toThrow("Invalid facing direction");
    });
  });

  it("should move the robot", async () => {
    // Given
    controller.placeRobot(1, 1, "NORTH");

    // When
    await controller.move();

    // Then
    expect(controller.report()).toBe("1,2,NORTH");
  });

  it("should not move the robot if it has not been placed", async () => {
    // Given not placed

    // When
    controller.move();

    // Then
    expect(controller.report()).toBe("Robot has not been placed");
  });

  it("should not move the robot off the table", async () => {
    // Given
    controller.placeRobot(1, 1, "SOUTH");

    // When
    await controller.move();

    // Then
    expect(controller.report()).toBe("1,1,SOUTH");
  });

  it("should not move the robot off the table - north", async () => {
    // Given
    controller.placeRobot(1, 4, "NORTH");

    // When
    await controller.move();

    // Then
    expect(controller.report()).toBe("1,4,NORTH");
  });

  describe("rotateLeft", () => {
    test.each([
      ["NORTH", "WEST"],
      ["WEST", "SOUTH"],
      ["SOUTH", "EAST"],
      ["EAST", "NORTH"],
    ] as FacingDirection[][])(
      "should rotate the robot left from %s to %s",
      async (initialDirection, expectedDirection) => {
        // Given
        controller.placeRobot(1, 1, initialDirection);

        // When
        await controller.rotateLeft();

        // Then
        expect(controller.report()).toBe(`1,1,${expectedDirection}`);
      },
    );
  });

  describe("rotateRight", () => {
    test.each([
      ["NORTH", "EAST"],
      ["WEST", "NORTH"],
      ["SOUTH", "WEST"],
      ["EAST", "SOUTH"],
    ] as FacingDirection[][])(
      "should rotate the robot right from %s to %s",
      async (initialDirection, expectedDirection) => {
        // Given
        controller.placeRobot(1, 1, initialDirection);

        // When
        await controller.rotateRight();

        // Then
        expect(controller.report()).toBe(`1,1,${expectedDirection}`);
      },
    );
  });
});
