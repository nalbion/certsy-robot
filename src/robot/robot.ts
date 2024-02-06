/**
 * Base robot class - doesn't do anything
 * @see VisualSimulation
 */
export default class Robot {
  setPosition(_x: number, _y: number): void {}

  setHeading(_heading: number): void {}

  move(): Promise<void> {
    return Promise.resolve();
  }

  rotateLeft(): Promise<void> {
    return Promise.resolve();
  }

  rotateRight(): Promise<void> {
    return Promise.resolve();
  }
}
