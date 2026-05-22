// Difficulty configs for the jigsaw minigame.
// pieceSize is in px; cols × rows is the puzzle grid.
export const JIGSAW_DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    cols: 2, rows: 2, pieceSize: 140,
    reward: 5,
    color: 0x2e7d32, accent: 0x66bb6a,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    cols: 3, rows: 3, pieceSize: 90,
    reward: 12,
    color: 0xf57c00, accent: 0xffb74d,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    cols: 4, rows: 3, pieceSize: 80,
    reward: 20,
    color: 0xc62828, accent: 0xef5350,
  },
};

export const JIGSAW_ORDER = ['easy', 'medium', 'hard'];
