import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { MONSTERS, MONSTER_IDS } from '../data/monsters.js';
import { JIGSAW_DIFFICULTIES } from '../data/jigsaw.js';
import { addCoins, getCoins, randomOwnedMonsterId } from '../state.js';
import { drawMonster } from '../render/monsterArt.js';
import { JigsawController } from '../controllers/JigsawController.js';
import { makeButton, makeCoinChip } from '../ui.js';

export default class JigsawScene extends Phaser.Scene {
  constructor() { super('JigsawScene'); }

  init(data) {
    const id = data?.difficultyId ?? 'easy';
    this.cfg = JIGSAW_DIFFICULTIES[id] ?? JIGSAW_DIFFICULTIES.easy;
  }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x1a1d2e);

    const pieces = this.cfg.cols * this.cfg.rows;
    this.add.text(GAME_W / 2, 28, `Jigsaw — ${this.cfg.label}`, {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 52, `${pieces} pieces · +${this.cfg.reward} coins on solve`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#b39ddb',
    }).setOrigin(0.5);

    // Coin chip
    this.coinChip = makeCoinChip(this, GAME_W - 90, 36, () => getCoins(this.registry));

    // Pick a monster
    const picked = randomOwnedMonsterId(this.registry) ?? this.starterFallback();
    this.monster = MONSTERS[picked];

    // Board geometry
    const { cols, rows, pieceSize } = this.cfg;
    const boardW = cols * pieceSize;
    const boardH = rows * pieceSize;
    const boardCx = GAME_W / 2;
    const boardCy = 200;

    // Empty board outline
    const frame = this.add.graphics();
    frame.lineStyle(3, 0x37474f, 0.9);
    frame.strokeRect(boardCx - boardW / 2, boardCy - boardH / 2, boardW, boardH);
    frame.lineStyle(1, 0x37474f, 0.5);
    for (let c = 1; c < cols; c++) {
      const x = boardCx - boardW / 2 + c * pieceSize;
      frame.lineBetween(x, boardCy - boardH / 2, x, boardCy + boardH / 2);
    }
    for (let r = 1; r < rows; r++) {
      const y = boardCy - boardH / 2 + r * pieceSize;
      frame.lineBetween(boardCx - boardW / 2, y, boardCx + boardW / 2, y);
    }

    this.add.text(boardCx, boardCy + boardH / 2 + 14, `puzzle: ${this.monster.name}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#78909c', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Controller + slots
    this.controller = new JigsawController();
    const slots = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        slots.push({
          col, row,
          x: boardCx - boardW / 2 + pieceSize / 2 + col * pieceSize,
          y: boardCy - boardH / 2 + pieceSize / 2 + row * pieceSize,
        });
      }
    }
    this.controller.setSlots(slots);

    this.buildPieces(boardCx, boardCy, boardW, boardH);

    makeButton(this, 70, 36, 110, 36, '← Back', () => {
      this.scene.start('HubScene');
    }, { fill: 0x37474f, fillHover: 0x546e7a });
  }

  starterFallback() {
    const commons = MONSTER_IDS.filter((id) => MONSTERS[id].rarity === 'common');
    return commons[Math.floor(Math.random() * commons.length)];
  }

  buildPieces(boardCx, boardCy, boardW, boardH) {
    const { cols, rows, pieceSize } = this.cfg;
    const total = cols * rows;

    // Tray layout: up to 6 columns wide, expand to multiple rows if needed
    const trayCols = Math.min(6, total);
    const trayRows = Math.ceil(total / trayCols);
    const trayPadX = 16;
    const trayCellW = pieceSize + trayPadX;
    const trayCellH = pieceSize + 8;
    const trayW = trayCols * trayCellW;
    const trayCy = 470;
    const trayStartX = GAME_W / 2 - trayW / 2 + trayCellW / 2;
    const trayStartY = trayCy - ((trayRows - 1) * trayCellH) / 2;

    // Build position list, shuffle, then assign in piece order
    const positions = [];
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / trayCols);
      const c = i % trayCols;
      positions.push({
        x: trayStartX + c * trayCellW,
        y: trayStartY + r * trayCellH,
      });
    }
    Phaser.Utils.Array.Shuffle(positions);

    // Piece source body diameter — fit comfortably inside the full board
    const bodySize = Math.min(boardW, boardH) * 0.86;

    let idx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        drawMonster(g, this.monster, bodySize);

        const rt = this.add.renderTexture(0, 0, pieceSize, pieceSize);
        rt.fill(0x263238, 1);
        // Place graphics so the (col, row) sub-region of the board lands inside this piece RT.
        // The monster center (graphics origin) belongs at board space (boardW/2, boardH/2);
        // the piece RT shows board sub-region [col*ps..col*ps+ps, row*ps..row*ps+ps],
        // so the monster center maps to RT (boardW/2 - col*ps, boardH/2 - row*ps).
        rt.draw(g, boardW / 2 - col * pieceSize, boardH / 2 - row * pieceSize);
        g.destroy();

        rt.setOrigin(0.5);
        const pos = positions[idx++];
        rt.setPosition(pos.x, pos.y);
        rt.setInteractive({ draggable: true, useHandCursor: true });

        const border = this.add.graphics();
        const updateBorder = (color = 0x90a4ae, alpha = 0.5, weight = 2) => {
          border.clear();
          border.lineStyle(weight, color, alpha);
          border.strokeRect(rt.x - pieceSize / 2, rt.y - pieceSize / 2, pieceSize, pieceSize);
        };
        updateBorder();

        const piece = {
          col, row,
          locked: false,
          gameObject: rt,
          startX: pos.x,
          startY: pos.y,
          border,
        };
        this.controller.registerPiece(piece);

        rt.on('dragstart', () => {
          if (piece.locked) return;
          this.children.bringToTop(rt);
          this.children.bringToTop(border);
          rt.setScale(1.06);
        });
        rt.on('drag', (_p, dx, dy) => {
          if (piece.locked) return;
          rt.setPosition(dx, dy);
          updateBorder();
        });
        rt.on('dragend', () => {
          if (piece.locked) { rt.setScale(1); updateBorder(); return; }
          rt.setScale(1);
          const snapped = this.controller.trySnap(piece);
          if (snapped) {
            updateBorder(0x4caf50, 1, 3);
            rt.disableInteractive();
            this.tweens.add({ targets: rt, scale: { from: 1.08, to: 1 }, duration: 160 });
            if (this.controller.isComplete()) this.handleWin();
          } else {
            updateBorder();
          }
        });
      }
    }
  }

  handleWin() {
    addCoins(this.registry, this.cfg.reward);
    this.coinChip.refresh();

    const txt = this.add.text(GAME_W / 2, 240, `+${this.cfg.reward} coins!`, {
      fontFamily: 'sans-serif', fontSize: '48px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);
    this.tweens.add({
      targets: txt, alpha: 1, scale: 1, duration: 400, ease: 'Back.out',
    });

    for (let i = 0; i < 50; i++) {
      const c = this.add.rectangle(
        GAME_W / 2, 240, 8, 12,
        Phaser.Display.Color.RandomRGB(120, 255).color,
      ).setAngle(Math.random() * 360);
      const ang = (Math.PI * 2 * i) / 50 + Math.random() * 0.4;
      const d = 160 + Math.random() * 160;
      this.tweens.add({
        targets: c,
        x: GAME_W / 2 + Math.cos(ang) * d,
        y: 240 + Math.sin(ang) * d,
        angle: Math.random() * 720 - 360,
        alpha: 0,
        duration: 1200,
        ease: 'Quad.out',
        onComplete: () => c.destroy(),
      });
    }

    this.time.delayedCall(900, () => {
      makeButton(this, GAME_W / 2 - 200, GAME_H - 40, 180, 44, 'Play Again', () => {
        this.scene.restart({ difficultyId: this.cfg.id });
      }, { fill: 0x2e7d32, fillHover: 0x43a047 });
      makeButton(this, GAME_W / 2, GAME_H - 40, 180, 44, 'Change Difficulty', () => {
        this.scene.start('MinigameSelectScene');
      }, { fill: 0xf57c00, fillHover: 0xffb74d });
      makeButton(this, GAME_W / 2 + 200, GAME_H - 40, 180, 44, 'Back to Hub', () => {
        this.scene.start('HubScene');
      }, { fill: 0x3949ab, fillHover: 0x5c6bc0 });
    });
  }
}
