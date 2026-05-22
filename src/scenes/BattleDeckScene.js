import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { MONSTERS } from '../data/monsters.js';
import { RARITIES, rarityRank } from '../data/rarities.js';
import { MIN_DECK_SIZE, statsFor } from '../data/battle.js';
import { expandedOwnedIds, totalCardsOwned } from '../state.js';
import { drawMonster } from '../render/monsterArt.js';
import { makeButton } from '../ui.js';

// Card "stacks" — each unique monster you own, with owned/selected counts.
function buildStacks(registry) {
  const all = expandedOwnedIds(registry); // duplicates expanded
  const map = new Map();
  for (const id of all) {
    if (!map.has(id)) map.set(id, { id, owned: 0, selected: 0 });
    map.get(id).owned++;
  }
  // Sort by rarity desc (rarest first — players naturally want to see best first)
  return [...map.values()].sort((a, b) =>
    rarityRank(MONSTERS[b.id].rarity) - rarityRank(MONSTERS[a.id].rarity)
    || MONSTERS[a.id].name.localeCompare(MONSTERS[b.id].name));
}

export default class BattleDeckScene extends Phaser.Scene {
  constructor() { super('BattleDeckScene'); }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0d0f1a);

    this.add.text(GAME_W / 2, 36, 'Pick Your Battle Deck', {
      fontFamily: 'sans-serif', fontSize: '28px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 64, `Select exactly ${MIN_DECK_SIZE} cards. Cards that die in battle are lost forever.`, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ef9a9a',
    }).setOrigin(0.5);

    // Back
    makeButton(this, 70, 36, 110, 36, '← Back', () => {
      this.scene.stop();
      if (this.scene.isPaused('HubScene')) this.scene.resume('HubScene');
      else this.scene.start('HubScene');
    }, { fill: 0x37474f, fillHover: 0x546e7a });

    this.stacks = buildStacks(this.registry);

    // If the player owns exactly MIN_DECK_SIZE cards, pre-select everything.
    const total = totalCardsOwned(this.registry);
    if (total === MIN_DECK_SIZE) {
      for (const s of this.stacks) s.selected = s.owned;
    }

    // Selection counter pill at top-right
    this.counter = this.add.text(GAME_W - 110, 36, '', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Auto-pick: rarest 20
    makeButton(this, GAME_W - 250, 36, 150, 36, 'Auto: Rarest 20', () => {
      this.autoPick();
    }, { fill: 0x9c27b0, fillHover: 0xab47bc, fontSize: 13 });

    // Scroll-y grid container
    this.gridLayer = this.add.container(0, 0);
    this.renderGrid();
    this.refreshCounter();

    // Start Battle button (bottom)
    this.startBtn = makeButton(this, GAME_W / 2, GAME_H - 36, 240, 50, 'Start Battle!', () => {
      const deckIds = [];
      for (const s of this.stacks) for (let i = 0; i < s.selected; i++) deckIds.push(s.id);
      this.scene.stop();
      this.scene.start('BattleScene', { playerDeckIds: deckIds });
    }, { fill: 0xc62828, fillHover: 0xef5350 });
    this.refreshStartBtn();
  }

  selectedTotal() {
    return this.stacks.reduce((s, st) => s + st.selected, 0);
  }

  refreshCounter() {
    const n = this.selectedTotal();
    this.counter.setText(`${n} / ${MIN_DECK_SIZE}`);
    this.counter.setColor(n === MIN_DECK_SIZE ? '#4caf50' : n > MIN_DECK_SIZE ? '#ef5350' : '#fff');
  }

  refreshStartBtn() {
    this.startBtn.setEnabled(this.selectedTotal() === MIN_DECK_SIZE);
  }

  autoPick() {
    for (const s of this.stacks) s.selected = 0;
    // Walk rarest-first (stacks is already sorted that way) and grab copies
    // until we hit the deck size.
    let remaining = MIN_DECK_SIZE;
    for (const s of this.stacks) {
      if (remaining <= 0) break;
      const take = Math.min(s.owned, remaining);
      s.selected = take;
      remaining -= take;
    }
    this.renderGrid();
    this.refreshCounter();
    this.refreshStartBtn();
  }

  renderGrid() {
    this.gridLayer.removeAll(true);

    const cols = 5;
    const cellW = 178, cellH = 88;
    const gap = 12;
    const totalW = cols * cellW + (cols - 1) * gap;
    const startX = (GAME_W - totalW) / 2 + cellW / 2;
    const startY = 130;

    this.stacks.forEach((stack, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);
      this.makeStackCell(x, y, cellW, cellH, stack);
    });
  }

  makeStackCell(x, y, w, h, stack) {
    const m = MONSTERS[stack.id];
    const r = RARITIES[m.rarity];
    const s = statsFor(m);

    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x0f1124).setStrokeStyle(2, r.color);

    // Mini art on the left
    const artG = this.add.graphics();
    drawMonster(artG, m, 50);
    artG.x = -w / 2 + 32;
    artG.y = 0;

    // Right side: name, stats, owned/selected
    const nameTxt = this.add.text(-w / 2 + 65, -h / 2 + 12, m.name, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0, 0);

    const rarityChip = this.add.text(-w / 2 + 65, -h / 2 + 28, r.label, {
      fontFamily: 'sans-serif', fontSize: '10px',
      color: '#' + r.color.toString(16).padStart(6, '0'),
    }).setOrigin(0, 0);

    const statsTxt = this.add.text(-w / 2 + 65, -h / 2 + 44,
      `HP ${s.hp}  DMG ${s.dmg}`, {
        fontFamily: 'sans-serif', fontSize: '10px', color: '#ffd54a',
      }).setOrigin(0, 0);

    const countTxt = this.add.text(-w / 2 + 65, h / 2 - 14,
      `${stack.selected} / ${stack.owned}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

    // +/- buttons at right edge
    const minus = makeButton(this, w / 2 - 38, h / 2 - 14, 24, 24, '-', () => {
      if (stack.selected > 0) {
        stack.selected--;
        countTxt.setText(`${stack.selected} / ${stack.owned}`);
        this.refreshCounter();
        this.refreshStartBtn();
      }
    }, { fill: 0x37474f, fillHover: 0x546e7a, fontSize: 16 });

    const plus = makeButton(this, w / 2 - 12, h / 2 - 14, 24, 24, '+', () => {
      if (stack.selected < stack.owned && this.selectedTotal() < MIN_DECK_SIZE) {
        stack.selected++;
        countTxt.setText(`${stack.selected} / ${stack.owned}`);
        this.refreshCounter();
        this.refreshStartBtn();
      }
    }, { fill: 0x2e7d32, fillHover: 0x43a047, fontSize: 16 });

    c.add([bg, artG, nameTxt, rarityChip, statsTxt, countTxt, minus, plus]);
    this.gridLayer.add(c);
  }
}
