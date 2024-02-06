import Robot from "./robot";

// const facingToHeading = {
//   NORTH: Math.PI / 2,
//   EAST: 0,
//   SOUTH: -Math.PI / 2,
//   WEST: Math.PI,
// };

// export type FacingDirection = keyof typeof facingToHeading;

export type FacingDirection = "NORTH" | "EAST" | "SOUTH" | "WEST";

const directions: Array<{ facing: FacingDirection; heading: number }> = [
  { facing: "NORTH", heading: Math.PI / 2 },
  { facing: "EAST", heading: 0 },
  { facing: "SOUTH", heading: (3 * Math.PI) / 2 },
  { facing: "WEST", heading: Math.PI },
];

/**
 * The RobotController will allow the robot to be placed on and move about on the table.
 * The robot will not be allowed to move off the table, or to teter precariously on the edge.
 */
export default class RobotController {
  private x?: number;
  private y?: number;
  private facing?: FacingDirection;
  // private heading?: number;
  private headingIndex?: number;

  constructor(private maxX: number, private maxY: number, private robot: Robot) {}

  placeRobot(x: number, y: number, facing: FacingDirection) {
    if (!this.isValidPlacement(x, y)) {
      throw new Error("Invalid position");
    }
    if (!["NORTH", "SOUTH", "EAST", "WEST"].includes(facing)) {
      throw new Error("Invalid facing direction");
    }

    this.x = x;
    this.y = y;
    this.facing = facing;
    this.robot.setPosition(x, y);
    // this.robot.setHeading(facingToHeading[facing]);
    this.headingIndex = directions.findIndex((d) => d.facing === facing);
    this.robot.setHeading(directions[this.headingIndex].heading);
  }

  move() {
    let x = this.x;
    let y = this.y;

    if (x === undefined || y === undefined || this.facing === undefined) {
      console.info("Robot has not been placed");
      return;
    }

    // Calculate the new position
    switch (this.facing) {
      case "NORTH":
        y++;
        break;
      case "EAST":
        x++;
        break;
      case "SOUTH":
        y--;
        break;
      case "WEST":
        x--;
        break;
    }

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

    this.headingIndex = (this.headingIndex - 1 + directions.length) % directions.length;
    this.facing = directions[this.headingIndex].facing;
    // this.robot.setHeading(directions[this.headingIndex].heading);
    return this.robot.rotateLeft();

    // const currentIndex = directions.findIndex((d) => d.facing === this.facing);
    // const newFacing = directions[(currentIndex + 1) % directions.length].facing;
    // this.facing = newFacing;
    // this.robot.setHeading(directions.find((d) => d.facing === newFacing)!!.heading);
  }

  rotateRight() {
    if (this.headingIndex === undefined) {
      console.info("Robot has not been placed");
      return;
    }

    this.headingIndex = (this.headingIndex + 1) % directions.length;
    this.facing = directions[this.headingIndex].facing;
    // this.robot.setHeading(directions[this.headingIndex].heading);
    return this.robot.rotateRight();
  }

  report() {
    if (this.x === undefined || this.y === undefined || this.facing === undefined) {
      return "Robot has not been placed";
    }

    return `${this.x},${this.y},${this.facing}`;
  }

  private isValidPlacement(x: number, y: number) {
    return x > 0 && x < this.maxX && y > 0 && y < this.maxY;
  }
}
