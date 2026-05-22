import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { MONSTERS, MONSTER_IDS } from '../data/monsters.js';
import { RARITIES, RARITY_ORDER, rarityRank } from '../data/rarities.js';
import { PACKS, PACK_ORDER } from '../data/packs.js';
import { ownedCount, getOwned } from '../state.js';
import { drawMonster } from '../render/monsterArt.js';
import { statsFor } from '../data/battle.js';
import { makeButton } from '../ui.js';

export default class DexScene extends Phaser.Scene {
  constructor() { super('DexScene'); }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.92);

    // Tab state
    this.activePack = PACK_ORDER[0];

    // Header
    this.add.text(GAME_W / 2, 36, 'Monster Dex', {
      fontFamily: 'sans-serif', fontSize: '32px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Totals
    const owned = getOwned(this.registry);
    const uniqueOwned = Object.keys(owned).length;
    const total = MONSTER_IDS.length;
    this.add.text(GAME_W / 2, 70, `${uniqueOwned} / ${total} unique`, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#b39ddb',
    }).setOrigin(0.5);

    // Tabs (one per pack) — placed on their own row, well clear of the back button.
    this.tabs = {};
    const tabW = 116, tabH = 34, gap = 10;
    const tabsTotalW = PACK_ORDER.length * tabW + (PACK_ORDER.length - 1) * gap;
    const tabsStartX = (GAME_W - tabsTotalW) / 2 + tabW / 2;
    const tabsY = 140;
    PACK_ORDER.forEach((pid, i) => {
      const x = tabsStartX + i * (tabW + gap);
      const pack = PACKS[pid];
      const t = makeButton(this, x, tabsY, tabW, tabH, pack.name.replace(' Pack', ''), () => {
        this.activePack = pid;
        this.renderGrid();
        this.refreshTabs();
      }, { fill: pack.color, fillHover: pack.accent, fontSize: 14 });
      this.tabs[pid] = t;
    });

    // Grid container
    this.gridLayer = this.add.container(0, 0);
    this.renderGrid();
    this.refreshTabs();

    // Back (top-left, clear of tabs)
    makeButton(this, 70, 36, 110, 36, '← Back', () => {
      this.scene.stop();
      this.scene.resume('HubScene');
    }, { fill: 0x37474f, fillHover: 0x546e7a });
  }

  refreshTabs() {
    for (const pid of PACK_ORDER) {
      const t = this.tabs[pid];
      t.bg.setStrokeStyle(pid === this.activePack ? 4 : 2, 0xffd54a, pid === this.activePack ? 1 : 0.2);
    }
  }

  renderGrid() {
    this.gridLayer.removeAll(true);

    // Monsters in this pack sorted by rarity then name
    const ids = MONSTER_IDS
      .filter((id) => MONSTERS[id].packId === this.activePack)
      .sort((a, b) =>
        rarityRank(MONSTERS[a].rarity) - rarityRank(MONSTERS[b].rarity)
        || MONSTERS[a].name.localeCompare(MONSTERS[b].name));

    const cols = 5;
    const cellW = 140, cellH = 160;
    const gap = 14;
    const totalW = cols * cellW + (cols - 1) * gap;
    const startX = (GAME_W - totalW) / 2 + cellW / 2;
    // Tabs live at y≈140 (bottom ~157). Cells are cellH tall and centered at startY,
    // so startY must be ≥ 157 + cellH/2 + breathing room.
    const startY = 260;

    ids.forEach((id, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);
      this.makeDexCell(x, y, cellW, cellH, id);
    });
  }

  makeDexCell(x, y, w, h, monsterId) {
    const m = MONSTERS[monsterId];
    const r = RARITIES[m.rarity];
    const count = ownedCount(this.registry, monsterId);
    const owned = count > 0;

    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x0f1124).setStrokeStyle(2, owned ? r.color : 0x37474f);
    const ribbon = this.add.rectangle(0, -h / 2 + 12, w - 6, 20, owned ? r.color : 0x37474f, 0.8);
    const rarityTxt = this.add.text(0, -h / 2 + 12, r.label.toUpperCase(), {
      fontFamily: 'sans-serif', fontSize: '11px', color: owned ? '#0f1124' : '#cfd8dc', fontStyle: 'bold',
    }).setOrigin(0.5);

    const artG = this.add.graphics();
    if (owned) {
      drawMonster(artG, m, 78);
      artG.y = -8;
    } else {
      drawMonster(artG, {
        ...m,
        art: { ...m.art, bodyColor: 0x111122, accent: 0x1a1a2e, eyes: 0, horns: 0, mouth: 'none' },
      }, 78);
      artG.y = -8;
      artG.setAlpha(0.55);
    }

    const nameTxt = this.add.text(0, h / 2 - 28, owned ? m.name : '???', {
      fontFamily: 'sans-serif', fontSize: '13px', color: owned ? '#fff' : '#78909c', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats (always visible — they're public info regardless of ownership)
    const s = statsFor(m);
    const statsTxt = this.add.text(0, h / 2 - 12,
      `HP ${s.hp} · DMG ${s.dmg}`, {
        fontFamily: 'sans-serif', fontSize: '11px',
        color: owned ? '#ffd54a' : '#78909c', fontStyle: 'bold',
      }).setOrigin(0.5);

    c.add([bg, ribbon, rarityTxt, artG, nameTxt, statsTxt]);

    if (owned && count > 1) {
      // Sit it above the name strip and clear of the rarity ribbon.
      const badge = this.add.container(w / 2 - 16, h / 2 - 46);
      const bdg = this.add.circle(0, 0, 14, 0xffd54a).setStrokeStyle(2, 0x4e342e);
      const bt  = this.add.text(0, 0, `×${count}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#4e342e', fontStyle: 'bold',
      }).setOrigin(0.5);
      badge.add([bdg, bt]);
      c.add(badge);
    }

    this.gridLayer.add(c);
  }
}
