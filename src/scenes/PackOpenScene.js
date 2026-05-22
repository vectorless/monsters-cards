import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { MONSTERS } from '../data/monsters.js';
import { RARITIES, rarityRank } from '../data/rarities.js';
import { PACKS } from '../data/packs.js';
import { drawMonster } from '../render/monsterArt.js';
import { statsFor } from '../data/battle.js';
import { makeButton } from '../ui.js';

const CARD_W = 240;
const CARD_H = 340;

export default class PackOpenScene extends Phaser.Scene {
  constructor() { super('PackOpenScene'); }

  init(data) {
    this.packId = data.packId;
    this.draws = data.draws;
    this.cursor = 0;
  }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.94);
    const pack = PACKS[this.packId];

    this.titleText = this.add.text(GAME_W / 2, 56, `${pack.name} opened!`, {
      fontFamily: 'sans-serif', fontSize: '30px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 90, '+1 energy card', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.progressText = this.add.text(GAME_W / 2, 110, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#b39ddb',
    }).setOrigin(0.5);

    this.hintText = this.add.text(GAME_W / 2, GAME_H - 80, 'tap to reveal', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.hintText, alpha: { from: 0.4, to: 1 },
      duration: 700, yoyo: true, repeat: -1,
    });

    // Tap anywhere = next card
    this.tapZone = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    this.tapZone.on('pointerdown', () => this.next());

    this.cardContainer = null;
    this.next(); // reveal first card
  }

  next() {
    if (this.busy) return;
    if (this.cursor >= this.draws.length) {
      this.scene.stop();
      this.scene.resume('ShopScene');
      return;
    }
    this.busy = true;

    // Fade out previous
    const old = this.cardContainer;
    if (old) {
      this.tweens.add({
        targets: old, alpha: 0, scale: 0.85, duration: 180, ease: 'Quad.in',
        onComplete: () => old.destroy(),
      });
    }

    const i = this.cursor;
    this.cursor++;
    this.progressText.setText(`Card ${i + 1} of ${this.draws.length}`);

    this.time.delayedCall(old ? 180 : 0, () => {
      const id = this.draws[i];
      this.cardContainer = this.makeCard(GAME_W / 2, GAME_H / 2, id);
      this.cardContainer.setScale(0);
      this.cardContainer.setAlpha(0);
      this.tweens.add({
        targets: this.cardContainer,
        scale: 1, alpha: 1,
        duration: 320, ease: 'Back.out',
        onComplete: () => { this.busy = false; },
      });

      const mon = MONSTERS[id];
      if (rarityRank(mon.rarity) >= rarityRank('rare')) {
        this.sparkle(GAME_W / 2, GAME_H / 2, RARITIES[mon.rarity].color);
      }
      if (rarityRank(mon.rarity) >= rarityRank('legendary')) {
        this.screenFlash(RARITIES[mon.rarity].color);
      }

      // Last card → swap hint to "Done"
      if (i === this.draws.length - 1) {
        this.hintText.setText('tap to finish');
      }
    });
  }

  makeCard(x, y, monsterId) {
    const monster = MONSTERS[monsterId];
    const r = RARITIES[monster.rarity];
    const c = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f1124, 1);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
    bg.lineStyle(6, r.color, 1);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);

    // Rarity ribbon top
    const ribbon = this.add.rectangle(0, -CARD_H / 2 + 26, CARD_W - 12, 36, r.color, 0.9);
    const ribText = this.add.text(0, -CARD_H / 2 + 26, r.label.toUpperCase(), {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#0f1124', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Art
    const artG = this.add.graphics();
    drawMonster(artG, monster, 170);
    artG.y = -20;

    // Name
    const nameTxt = this.add.text(0, CARD_H / 2 - 56, monster.name, {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats row
    const s = statsFor(monster);
    const statsTxt = this.add.text(0, CARD_H / 2 - 28,
      `HP ${s.hp}    DMG ${s.dmg}`, {
        fontFamily: 'sans-serif', fontSize: '16px', color: '#ffd54a', fontStyle: 'bold',
      }).setOrigin(0.5);

    c.add([bg, ribbon, ribText, artG, nameTxt, statsTxt]);
    return c;
  }

  sparkle(x, y, color) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count;
      const s = this.add.circle(x, y, 5, color);
      this.tweens.add({
        targets: s,
        x: x + Math.cos(ang) * 180,
        y: y + Math.sin(ang) * 180,
        alpha: 0,
        duration: 900,
        ease: 'Quad.out',
        onComplete: () => s.destroy(),
      });
    }
  }

  screenFlash(color) {
    const f = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, color, 0.55);
    this.tweens.add({
      targets: f, alpha: 0, duration: 600, ease: 'Quad.out',
      onComplete: () => f.destroy(),
    });
  }
}
