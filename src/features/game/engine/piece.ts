import type { Coordinate, Rotation } from "@/features/game/engine/tetromino";
import { TETROMINO_SHAPES, rotateIndex } from "@/features/game/engine/tetromino";
import { getWallKickOffsets } from "@/features/game/engine/srs";
import type { ActivePiece } from "@/features/game/engine/state";

export const getPieceCells = (piece: ActivePiece): Coordinate[] =>
  TETROMINO_SHAPES[piece.type][piece.rotation].map(({ x, y }) => ({
    x: piece.position.x + x,
    y: piece.position.y + y,
  }));

export const translatePiece = (piece: ActivePiece, deltaX: number, deltaY: number): ActivePiece => ({
  ...piece,
  position: {
    x: piece.position.x + deltaX,
    y: piece.position.y + deltaY,
  },
});

export const rotatePiece = (piece: ActivePiece, direction: 1 | -1): ActivePiece => ({
  ...piece,
  rotation: rotateIndex(piece.rotation, direction),
});

export const attemptRotation = (
  piece: ActivePiece,
  direction: 1 | -1,
  isValid: (candidate: ActivePiece) => boolean,
): ActivePiece | null => {
  const nextRotation = rotatePiece(piece, direction);
  const kicks = getWallKickOffsets(piece.type, piece.rotation, nextRotation.rotation as Rotation);
  for (const [dx, dy] of kicks) {
    const candidate: ActivePiece = {
      ...nextRotation,
      position: {
        x: nextRotation.position.x + dx,
        y: nextRotation.position.y + dy,
      },
    };
    if (isValid(candidate)) {
      return candidate;
    }
  }
  return null;
};
