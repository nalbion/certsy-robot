# Robot Challenge

[Play with me!](https://nalbion.github.io/certsy-robot)
[![Robot Simulator UI](src/__image_snapshots__/ui-test.png?raw=true)](https://nalbion.github.io/certsy-robot)

## Description

- The application is a simulation of a toy robot moving on a square tabletop, of dimensions 5 units x 5 units.
- There are no other obstructions on the table surface.
- The robot is free to roam around the surface of the table, but must be prevented from falling to destruction. Any movement that would result in the robot falling from the table must be prevented, however further valid movement commands must still be allowed.

The application can read in commands of the following form:

```plain
PLACE X,Y,F
MOVE
LEFT
RIGHT
REPORT
MOVE
REPORT
```

- `PLACE` will put the toy robot on the table in position X,Y and facing NORTH, SOUTH, EAST or WEST.
- The origin (0,0) can be considered to be the SOUTH WEST most corner.
- The first valid command to the robot is a PLACE command, after that, any sequence of commands may be issued, in any order, including another PLACE command. The application should discard all commands in the sequence until a valid PLACE command has been executed.
- `MOVE` will move the toy robot one unit forward in the direction it is currently facing.
- `LEFT` and `RIGHT` will rotate the robot 90 degrees in the specified direction without changing the position of the robot.
- `REPORT` will announce the X,Y and orientation of the robot.
- A robot that is not on the table will ignore the `MOVE`, `LEFT`, `RIGHT` and `REPORT` commands.
- many `REPORT` commands can be received per session.
- The application can be exited by `EXIT` or pressing `Ctrl-C`.
- Provide test data to exercise the application.

## Usage

### CLI

Run `npm run cli` which will prompt with

```bash
==== Robot Simulator ====
Commands: `PLACE X,Y,F`, MOVE, LEFT, RIGHT, REPORT
```

...Now you can start entering commands followed by `Enter`:

```bash
PLACE 2,2,NORTH
REPORT
```

### Web UI

```bash
npm run dev
```

Now browse to [http://localhost:4173](http://localhost:4173)

## Constraints

The toy robot must not fall off the table during movement. This also includes the initial placement of the toy robot.
Any move that would cause the robot to fall must be ignored.

Example Input and Output:

```plain
PLACE 0,0,NORTH
MOVE
REPORT
Output: 0,1,NORTH
```

```plain
PLACE 0,0,NORTH
LEFT
REPORT
Output: 0,0,WEST
```

```plain
PLACE 1,2,EAST
MOVE
MOVE
LEFT
MOVE
REPORT
Output: 3,3,NORTH
```
