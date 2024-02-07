import Robot from "./robot";

export type FacingDirection = "NORTH" | "EAST" | "SOUTH" | "WEST";

const directions: Array<{
  facing: FacingDirection;
  heading: number;
  move: (x: number, y: number) => { x: number; y: number };
}> = [
  {
    facing: "NORTH",
    heading: Math.PI / 2,
    move: (x, y) => ({ x, y: y + 1 }),
  },
  {
    facing: "EAST",
    heading: 0,
    move: (x, y) => ({ x: x + 1, y }),
  },
  {
    facing: "SOUTH",
    heading: (3 * Math.PI) / 2,
    move: (x, y) => ({ x, y: y - 1 }),
  },
  {
    facing: "WEST",
    heading: Math.PI,
    move: (x, y) => ({ x: x - 1, y }),
  },
];

/**
 * The RobotController will allow the robot to be placed on and move about on the table.
 * The robot will not be allowed to move off the table, or to teter precariously on the edge.
 */
export default class RobotController {
  private x?: number;
  private y?: number;
  private facing?: FacingDirection;
  private headingIndex?: number;

  constructor(
    private maxX: number,
    private maxY: number,
    private robot: Robot,
  ) {}

  placeRobot(x: number, y: number, facing: FacingDirection) {
    if (!this.isValidPlacement(x, y)) {
      throw new Error("Invalid position");
    }
    if (!["NORTH", "SOUTH", "EAST", "WEST"].includes(facing)) {
      throw new Error(
        "Invalid facing direction. Valid options are NORTH, SOUTH, EAST, WEST.",
      );
    }

    this.x = x;
    this.y = y;
    this.facing = facing;
    this.robot.setPosition(x, y);
    this.headingIndex = directions.findIndex((d) => d.facing === facing);
    this.robot.setHeading(directions[this.headingIndex].heading);
  }

  move() {
    if (
      this.x === undefined ||
      this.y === undefined ||
      this.headingIndex === undefined
    ) {
      console.info("Robot has not been placed");
      return;
    }

    // Calculate the new position
    const { x, y } = directions[this.headingIndex].move(this.x, this.y);

    if (!this.isValidPlacement(x, y)) {
      console.warn("Robot would fall off the table");
      return;
    }

    // Move the robot
    this.x = x;
    this.y = y;
    return this.robot.move();
  }

  rotateLeft() {
    if (this.headingIndex === undefined) {
      console.info("Robot has not been placed");
      return;
    }

    this.headingIndex =
      (this.headingIndex - 1 + directions.length) % directions.length;
    this.facing = directions[this.headingIndex].facing;
    return this.robot.rotateLeft();
  }

  rotateRight() {
    if (this.headingIndex === undefined) {
      console.info("Robot has not been placed");
      return;
    }

    this.headingIndex = (this.headingIndex + 1) % directions.length;
    this.facing = directions[this.headingIndex].facing;
    return this.robot.rotateRight();
  }

  report() {
    if (
      this.x === undefined ||
      this.y === undefined ||
      this.facing === undefined
    ) {
      return "Robot has not been placed";
    }

    return `${this.x},${this.y},${this.facing}`;
  }

  private isValidPlacement(x: number, y: number) {
    return x > 0 && x < this.maxX && y > 0 && y < this.maxY;
  }
}
