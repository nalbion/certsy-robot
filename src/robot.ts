export default interface Robot {
  setPosition(x: number, y: number): void;
  setHeading(heading: number): void;
  move(): Promise<void>;
  rotateLeft(): Promise<void>;
  rotateRight(): Promise<void>;
}
