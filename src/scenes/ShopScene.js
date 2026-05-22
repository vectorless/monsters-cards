import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { PACKS, PACK_ORDER, PACK_COST } from '../data/packs.js';
import { getCoins, tryOpenPack } from '../state.js';
import { makeButton, makeCoinChip } from '../ui.js';

export default class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.85);
    this.add.text(GAME_W / 2, 60, 'Pack Shop', {
      fontFamily: 'sans-serif', fontSize: '40px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 100, `${PACK_COST} coins each · 5 cards per pack`, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#b39ddb',
    }).setOrigin(0.5);

    // Coin chip
    this.coinChip = makeCoinChip(this, GAME_W - 90, 40, () => getCoins(this.registry));

    // 5 pack cards
    const cardW = 160, cardH = 240;
    const gap = 20;
    const totalW = PACK_ORDER.length * cardW + (PACK_ORDER.length - 1) * gap;
    const startX = (GAME_W - totalW) / 2 + cardW / 2;
    const cy = 320;

    this.packButtons = [];
    PACK_ORDER.forEach((id, i) => {
      const x = startX + i * (cardW + gap);
      this.drawPackCard(x, cy, cardW, cardH, id);
    });

    // Back button
    makeButton(this, 80, 40, 120, 40, '← Back', () => {
      this.scene.stop();
      this.scene.resume('HubScene');
    }, { fill: 0x37474f, fillHover: 0x546e7a });

    this.refreshButtons();
  }

  drawPackCard(x, y, w, h, packId) {
    const pack = PACKS[packId];
    const card = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, pack.color).setStrokeStyle(3, pack.accent);
    const stripe = this.add.rectangle(0, -h / 2 + 24, w, 36, pack.accent, 0.35);
    const nameTxt = this.add.text(0, -h / 2 + 24, pack.name, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Simple "pack art" — overlapping shapes in pack colors
    const art = this.add.graphics();
    art.fillStyle(pack.accent, 0.85);
    art.fillCircle(-22, 10, 30);
    art.fillStyle(0xffffff, 0.6);
    art.fillCircle(15, -8, 22);
    art.fillStyle(pack.accent, 1);
    art.fillCircle(8, 24, 18);

    const blurb = this.add.text(0, h / 2 - 80, pack.blurb, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#fff', wordWrap: { width: w - 16 }, align: 'center',
    }).setOrigin(0.5);

    const btn = makeButton(this, 0, h / 2 - 30, w - 24, 40, `Open · ${PACK_COST}`, () => {
      const draws = tryOpenPack(this.registry, packId);
      if (!draws) {
        this.tweens.add({ targets: card, x: { from: x - 6, to: x + 6 }, duration: 50, yoyo: true, repeat: 3, onComplete: () => card.setX(x) });
        return;
      }
      this.coinChip.refresh();
      this.refreshButtons();
      this.scene.launch('PackOpenScene', { packId, draws });
      this.scene.pause();
    }, { fill: 0x000000, fillHover: 0x263238, fillDown: 0x000000 });

    card.add([bg, stripe, nameTxt, art, blurb, btn]);
    this.packButtons.push({ card, btn });
  }

  refreshButtons() {
    const can = getCoins(this.registry) >= PACK_COST;
    this.packButtons.forEach(({ btn }) => btn.setEnabled(can));
  }

  // When PackOpenScene resumes us, refresh
  init() {
    this.events.on('resume', () => {
      this.coinChip?.refresh();
      this.refreshButtons();
    });
  }
}
