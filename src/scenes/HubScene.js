import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { getCoins, totalCardsOwned } from '../state.js';
import { MIN_DECK_SIZE } from '../data/battle.js';
import { makeButton, makeCoinChip } from '../ui.js';

export default class HubScene extends Phaser.Scene {
  constructor() { super('HubScene'); }

  create() {
    // Background
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x1a1d2e);
    // Title
    this.add.text(GAME_W / 2, 100, 'MONSTERS CARDS', {
      fontFamily: 'sans-serif', fontSize: '56px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 150, 'collect them all', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#b39ddb',
    }).setOrigin(0.5);

    // Coin chip top-right
    this.coinChip = makeCoinChip(this, GAME_W - 90, 40, () => getCoins(this.registry));

    // Big menu buttons
    const bw = 280, bh = 58;
    const cx = GAME_W / 2;
    makeButton(this, cx, 230, bw, bh, 'Play Minigames', () => {
      this.scene.launch('MinigameSelectScene');
      this.scene.pause();
    }, { fill: 0x2e7d32, fillHover: 0x43a047 });

    makeButton(this, cx, 300, bw, bh, 'Open Packs', () => {
      this.scene.launch('ShopScene');
      this.scene.pause();
    }, { fill: 0xc62828, fillHover: 0xef5350 });

    // Battle button — gated on owning at least MIN_DECK_SIZE cards (counting copies)
    const total = totalCardsOwned(this.registry);
    const canBattle = total >= MIN_DECK_SIZE;
    const battleBtn = makeButton(this, cx, 370, bw, bh,
      canBattle ? 'Battle!' : `Battle (need ${MIN_DECK_SIZE} cards)`,
      () => {
        if (!canBattle) return;
        this.scene.start('BattleDeckScene');
      },
      { fill: 0xff6f00, fillHover: 0xffa726 });
    battleBtn.setEnabled(canBattle);

    makeButton(this, cx, 440, bw, bh, 'Monster Dex', () => {
      this.scene.launch('DexScene');
      this.scene.pause();
    }, { fill: 0x4527a0, fillHover: 0x673ab7 });

    this.add.text(GAME_W / 2, GAME_H - 36, `you own ${total} card${total === 1 ? '' : 's'}`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#7986cb',
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, GAME_H - 18, 'play jigsaw → earn coins → open packs → battle', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#5c6bc0',
    }).setOrigin(0.5);

    // Refresh coin display when scene resumes
    this.events.on('resume', () => this.coinChip.refresh());
    this.events.on('wake',   () => this.coinChip.refresh());
  }
}
