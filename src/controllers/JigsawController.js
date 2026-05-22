// Logic for the 4-piece puzzle: tracks piece state, snap targets, completion.
// Scene owns rendering + input; controller owns "where does each piece belong" + win check.

export const PIECE_SIZE = 160;
export const SNAP_DISTANCE = 32;

export class JigsawController {
  constructor() {
    // Slot positions (set by scene before pieces are created)
    this.slots = []; // [{ col, row, x, y }]
    this.pieces = []; // [{ col, row, locked, gameObject, startX, startY }]
  }

  setSlots(slots) {
    this.slots = slots;
  }

  registerPiece(piece) {
    this.pieces.push(piece);
  }

  slotFor(col, row) {
    return this.slots.find((s) => s.col === col && s.row === row);
  }

  // Try to snap the given piece based on its current x/y. Returns true if snapped.
  trySnap(piece) {
    if (piece.locked) return false;
    const slot = this.slotFor(piece.col, piece.row);
    const dx = piece.gameObject.x - slot.x;
    const dy = piece.gameObject.y - slot.y;
    if (Math.hypot(dx, dy) <= SNAP_DISTANCE) {
      piece.gameObject.x = slot.x;
      piece.gameObject.y = slot.y;
      piece.locked = true;
      return true;
    }
    return false;
  }

  isComplete() {
    return this.pieces.length > 0 && this.pieces.every((p) => p.locked);
  }
}
