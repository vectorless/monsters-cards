import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { JIGSAW_DIFFICULTIES, JIGSAW_ORDER } from '../data/jigsaw.js';
import { makeButton } from '../ui.js';

export default class MinigameSelectScene extends Phaser.Scene {
  constructor() { super('MinigameSelectScene'); }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.85);
    this.add.text(GAME_W / 2, 70, 'Jigsaw Puzzle', {
      fontFamily: 'sans-serif', fontSize: '40px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 110, 'pick a difficulty — harder puzzles pay more', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#b39ddb',
    }).setOrigin(0.5);

    // 3 difficulty cards
    const cardW = 240, cardH = 280, gap = 28;
    const totalW = JIGSAW_ORDER.length * cardW + (JIGSAW_ORDER.length - 1) * gap;
    const startX = (GAME_W - totalW) / 2 + cardW / 2;
    const cy = 330;
    JIGSAW_ORDER.forEach((id, i) => {
      const x = startX + i * (cardW + gap);
      this.makeDifficultyCard(x, cy, cardW, cardH, id);
    });

    // Back — handles both "launched from Hub paused" and "started fresh from win screen"
    makeButton(this, 70, 36, 110, 36, '← Back', () => {
      this.scene.stop();
      if (this.scene.isPaused('HubScene')) this.scene.resume('HubScene');
      else this.scene.start('HubScene');
    }, { fill: 0x37474f, fillHover: 0x546e7a });
  }

  makeDifficultyCard(x, y, w, h, diffId) {
    const cfg = JIGSAW_DIFFICULTIES[diffId];
    const pieces = cfg.cols * cfg.rows;

    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x1a1d2e).setStrokeStyle(3, cfg.color);

    const label = this.add.text(0, -h / 2 + 28, cfg.label, {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const piecesText = this.add.text(0, -h / 2 + 70, `${pieces} pieces`, {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#cfd8dc',
    }).setOrigin(0.5);

    // Mini preview grid showing the cols×rows layout
    const previewBoxW = Math.min(w - 60, 160);
    const previewCell = Math.floor(Math.min(previewBoxW / cfg.cols, 90 / cfg.rows));
    const previewW = previewCell * cfg.cols;
    const previewH = previewCell * cfg.rows;
    const previewG = this.add.graphics();
    previewG.fillStyle(cfg.color, 0.25);
    previewG.fillRect(-previewW / 2, -previewH / 2 - 5, previewW, previewH);
    previewG.lineStyle(2, cfg.accent, 1);
    for (let c = 0; c <= cfg.cols; c++) {
      const px = -previewW / 2 + c * previewCell;
      previewG.lineBetween(px, -previewH / 2 - 5, px, previewH / 2 - 5);
    }
    for (let r = 0; r <= cfg.rows; r++) {
      const py = -previewH / 2 - 5 + r * previewCell;
      previewG.lineBetween(-previewW / 2, py, previewW / 2, py);
    }
    previewG.y = 10;

    const reward = this.add.text(0, h / 2 - 80, `Reward: +${cfg.reward}`, {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5);

    const btn = makeButton(this, 0, h / 2 - 36, w - 40, 44, 'Play', () => {
      this.scene.stop();
      this.scene.stop('HubScene');
      this.scene.start('JigsawScene', { difficultyId: diffId });
    }, { fill: cfg.color, fillHover: cfg.accent });

    card.add([bg, label, piecesText, previewG, reward, btn]);
  }
}
