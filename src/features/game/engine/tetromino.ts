export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
export type Rotation = 0 | 1 | 2 | 3;

export interface Coordinate { x: number; y: number }

export const TETROMINO_SEQUENCE: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];

// Rotate 90° clockwise around origin in math coords; in y-down canvas this appears CCW.
const rotateCWCoord = ({ x, y }: Coordinate): Coordinate => ({ x: y, y: -x });

// Base rotation (0) for each piece (around origin pivot consistent with SRS order)
const R0: Record<TetrominoType, Coordinate[]> = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
  J: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
  ],
  L: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  S: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
  Z: [
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
};

const buildRotations = (r0: Coordinate[]): Coordinate[][] => {
  const r1 = r0.map(rotateCWCoord);
  const r2 = r1.map(rotateCWCoord);
  const r3 = r2.map(rotateCWCoord);
  return [r0, r1, r2, r3];
};

export const TETROMINO_SHAPES: Record<TetrominoType, Coordinate[][]> = {
  I: buildRotations(R0.I),
  J: buildRotations(R0.J),
  L: buildRotations(R0.L),
  O: [R0.O, R0.O, R0.O, R0.O],
  S: buildRotations(R0.S),
  T: buildRotations(R0.T),
  Z: buildRotations(R0.Z),
};

export const rotateIndex = (rotation: Rotation, direction: 1 | -1): Rotation =>
  (((rotation + direction + 4) % 4) as Rotation);

