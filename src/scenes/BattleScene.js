import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main.js';
import { RARITIES } from '../data/rarities.js';
import {
  ATTACKS, statsFor,
  COINS_PER_SURVIVOR, WIN_BONUS_COINS,
} from '../data/battle.js';
import { addCoins, removeMonster, getCoins } from '../state.js';
import { drawMonster } from '../render/monsterArt.js';
import { BattleController, buildOpponentDeck } from '../controllers/BattleController.js';
import { makeButton, makeCoinChip } from '../ui.js';

const CARD_W = 360;
const CARD_H = 140;

export default class BattleScene extends Phaser.Scene {
  constructor() { super('BattleScene'); }

  init(data) {
    this.playerDeckIds = data?.playerDeckIds ?? [];
  }

  create() {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0d0f1a);

    // Build battle state
    this.battle = new BattleController({
      playerDeckIds: this.playerDeckIds,
      opponentDeckIds: buildOpponentDeck(),
    });
    this.busy = false;
    this.endedBattle = false;

    // Top strip
    this.turnText = this.add.text(GAME_W / 2, 30, 'Your Turn', {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#ffd54a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.coinChip = makeCoinChip(this, GAME_W - 90, 32, () => getCoins(this.registry));

    // Counts placed away from the Forfeit button (top-left) and energy chips (bottom-left).
    this.oppCountText = this.add.text(220, 32, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ef9a9a', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.playerCountText = this.add.text(220, 462, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#81c784', fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Card areas
    this.opponentView = this.makeCardView(GAME_W / 2, 140, 'opponent');
    this.playerView   = this.makeCardView(GAME_W / 2, 380, 'player');

    // Battle log
    this.logText = this.add.text(GAME_W / 2, 250, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#cfd8dc', align: 'center',
    }).setOrigin(0.5);

    // Energy chips
    this.energyChips = [];
    const chipY = 510;
    const chipsTotalW = 3 * 40 + 2 * 12;
    const chipsStartX = 80;
    for (let i = 0; i < 3; i++) {
      const x = chipsStartX + i * (40 + 12);
      const card = this.add.rectangle(x, chipY, 32, 44, 0xffd54a).setStrokeStyle(2, 0xff8f00);
      const bolt = this.add.text(x, chipY, '⚡', {
        fontFamily: 'sans-serif', fontSize: '20px', color: '#4e342e', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.energyChips.push({ card, bolt });
    }
    this.add.text(chipsStartX - 56, chipY, 'Energy', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#b0bec5', fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Attack buttons
    this.quickBtn = makeButton(this, GAME_W / 2 - 110, chipY, 180, 44,
      `Quick (1⚡ · ${ATTACKS[0].base} dmg)`,
      () => this.playerAttack('quick'),
      { fill: 0x2e7d32, fillHover: 0x43a047, fontSize: 14 },
    );
    this.heavyBtn = makeButton(this, GAME_W / 2 + 90, chipY, 180, 44,
      `Heavy (2⚡ · ${ATTACKS[1].base} dmg)`,
      () => this.playerAttack('heavy'),
      { fill: 0xc62828, fillHover: 0xef5350, fontSize: 14 },
    );
    this.endTurnBtn = makeButton(this, GAME_W - 110, chipY, 160, 44, 'End Turn', () => this.endPlayerTurn(),
      { fill: 0x3949ab, fillHover: 0x5c6bc0, fontSize: 14 });

    // Quit
    makeButton(this, 70, 36, 110, 36, '← Forfeit', () => this.forfeit(),
      { fill: 0x37474f, fillHover: 0x546e7a });

    // Initial paint
    this.refreshCardView('opponent');
    this.refreshCardView('player');
    this.refreshHud();
  }

  // ─────── Card view ───────
  makeCardView(x, y, side) {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x1a1d2e).setStrokeStyle(3, 0x546e7a);
    const artG = this.add.graphics();
    artG.x = -CARD_W / 2 + 70;
    artG.y = 0;
    const nameTxt = this.add.text(-CARD_W / 2 + 130, -CARD_H / 2 + 18, '', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0, 0);
    const rarityTxt = this.add.text(-CARD_W / 2 + 130, -CARD_H / 2 + 44, '', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0, 0);
    const dmgTxt = this.add.text(CARD_W / 2 - 14, -CARD_H / 2 + 44, '', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#ffab91', fontStyle: 'bold',
    }).setOrigin(1, 0);
    // HP bar with the HP number overlaid inside.
    const hpBarBg = this.add.rectangle(-CARD_W / 2 + 130 + 100, CARD_H / 2 - 28, 200, 22, 0x263238)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0x546e7a);
    const hpBarFg = this.add.rectangle(-CARD_W / 2 + 130, CARD_H / 2 - 28, 200, 20, 0x4caf50).setOrigin(0, 0.5);
    const hpTxt = this.add.text(-CARD_W / 2 + 130 + 100, CARD_H / 2 - 28, '', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#fff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    c.add([bg, artG, nameTxt, rarityTxt, dmgTxt, hpBarBg, hpBarFg, hpTxt]);

    return { container: c, bg, artG, nameTxt, rarityTxt, dmgTxt, hpTxt, hpBarBg, hpBarFg };
  }

  refreshCardView(side) {
    const view = side === 'player' ? this.playerView : this.opponentView;
    const card = side === 'player' ? this.battle.playerActive : this.battle.opponentActive;
    if (!card) {
      view.container.setVisible(false);
      return;
    }
    view.container.setVisible(true);
    const m = card.monster;
    const r = RARITIES[m.rarity];

    drawMonster(view.artG, m, 90);
    view.bg.setStrokeStyle(3, r.color);
    view.nameTxt.setText(m.name);
    view.rarityTxt.setText(r.label);
    view.rarityTxt.setColor('#' + r.color.toString(16).padStart(6, '0'));
    const s = statsFor(m);
    view.dmgTxt.setText(`DMG ${s.dmg}`);
    view.hpTxt.setText(`HP ${card.hp} / ${card.maxHp}`);
    const frac = card.hp / card.maxHp;
    view.hpBarFg.displayWidth = 200 * frac;
    const color = frac > 0.5 ? 0x4caf50 : frac > 0.2 ? 0xffb300 : 0xe53935;
    view.hpBarFg.fillColor = color;
  }

  refreshHud() {
    this.oppCountText.setText(`Opponent cards: ${this.battle.alive('opponent')}`);
    this.playerCountText.setText(`Your cards: ${this.battle.alive('player')}`);
    const last3 = this.battle.log.slice(-3).join('\n');
    this.logText.setText(last3);

    // Energy chips
    for (let i = 0; i < this.energyChips.length; i++) {
      const lit = i < this.battle.energy;
      this.energyChips[i].card.setFillStyle(lit ? 0xffd54a : 0x37474f);
      this.energyChips[i].bolt.setColor(lit ? '#4e342e' : '#90a4ae');
    }

    // Buttons
    const myTurn = this.battle.turn === 'player' && !this.busy && !this.endedBattle;
    this.quickBtn.setEnabled(myTurn && this.battle.energy >= ATTACKS[0].energy);
    this.heavyBtn.setEnabled(myTurn && this.battle.energy >= ATTACKS[1].energy);
    this.endTurnBtn.setEnabled(myTurn);

    this.turnText.setText(this.battle.turn === 'player' ? 'Your Turn' : "Opponent's Turn");
    this.turnText.setColor(this.battle.turn === 'player' ? '#ffd54a' : '#ef5350');
  }

  // ─────── Actions ───────
  async playerAttack(attackId) {
    if (this.busy || this.endedBattle) return;
    const res = this.battle.playerAttack(attackId);
    if (!res) return;
    this.busy = true;
    this.refreshHud();
    await this.animateAttack('player', 'opponent', res.damage);
    this.refreshCardView('opponent');
    if (res.killed) {
      await this.animateCardDeath('opponent');
      this.refreshCardView('opponent');
    }
    this.refreshHud();
    this.busy = false;
    if (this.checkBattleOver()) return;
  }

  async endPlayerTurn() {
    if (this.busy || this.endedBattle) return;
    this.busy = true;
    this.battle.endPlayerTurn();
    this.refreshHud();

    // Opponent turn
    const actions = this.battle.prepareAndApplyOpponentTurn();
    for (const a of actions) {
      if (this.endedBattle) break;
      const result = this.battle.applyOpponentAction(a);
      this.refreshHud();
      await this.animateAttack('opponent', 'player', a.damage);
      this.refreshCardView('player');
      if (result.killed) {
        await this.animateCardDeath('player');
        this.refreshCardView('player');
        // If player has another card, opponent stops attacking this turn
        // (simple v1: one target per turn even after KO).
        break;
      }
    }

    if (this.checkBattleOver()) { this.busy = false; return; }

    this.battle.startPlayerTurn();
    this.refreshHud();
    this.busy = false;
  }

  // ─────── Animations ───────
  animateAttack(fromSide, toSide, dmg) {
    const fromV = fromSide === 'player' ? this.playerView : this.opponentView;
    const toV   = toSide   === 'player' ? this.playerView : this.opponentView;
    const dy = fromSide === 'player' ? -40 : 40;

    return new Promise((resolve) => {
      this.tweens.add({
        targets: fromV.container,
        y: { from: fromV.container.y, to: fromV.container.y + dy },
        duration: 140, yoyo: true, ease: 'Quad.out',
      });
      // Damage number popping over the target
      const dmgText = this.add.text(toV.container.x + 80, toV.container.y - 10, `-${dmg}`, {
        fontFamily: 'sans-serif', fontSize: '36px', color: '#ff5252', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: dmgText,
        y: dmgText.y - 50,
        alpha: 0,
        duration: 700, ease: 'Quad.out',
        onComplete: () => dmgText.destroy(),
      });
      // Hit shake
      this.tweens.add({
        targets: toV.container,
        x: { from: toV.container.x - 6, to: toV.container.x + 6 },
        duration: 50, yoyo: true, repeat: 2,
        onComplete: () => { toV.container.x = GAME_W / 2; resolve(); },
      });
    });
  }

  animateCardDeath(side) {
    const v = side === 'player' ? this.playerView : this.opponentView;
    return new Promise((resolve) => {
      this.tweens.add({
        targets: v.container,
        scale: 0, alpha: 0, angle: side === 'player' ? -25 : 25,
        duration: 450, ease: 'Back.in',
        onComplete: () => {
          v.container.setScale(1).setAlpha(1).setAngle(0);
          resolve();
        },
      });
    });
  }

  // ─────── End of battle ───────
  checkBattleOver() {
    if (!this.battle.isOver()) return false;
    this.endedBattle = true;
    const winner = this.battle.winner();

    // Permanently remove every player card that died.
    const dead = this.battle.playerCards.filter((c) => c.dead);
    const lostByMonster = new Map();
    for (const c of dead) {
      lostByMonster.set(c.monsterId, (lostByMonster.get(c.monsterId) ?? 0) + 1);
    }
    for (const [id, n] of lostByMonster) removeMonster(this.registry, id, n);

    let reward = 0;
    if (winner === 'player') {
      const survivors = this.battle.alive('player');
      reward = survivors * COINS_PER_SURVIVOR + WIN_BONUS_COINS;
      addCoins(this.registry, reward);
      this.coinChip.refresh();
    }
    this.showEndScreen(winner, reward, dead.length);
    return true;
  }

  showEndScreen(winner, reward, lostCount) {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.78);
    const won = winner === 'player';
    this.add.text(GAME_W / 2, 140, won ? 'VICTORY!' : 'DEFEAT', {
      fontFamily: 'sans-serif', fontSize: '64px',
      color: won ? '#ffd54a' : '#ef5350',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    const survivors = this.battle.alive('player');
    const lines = [];
    if (won) {
      lines.push(`${survivors} card${survivors === 1 ? '' : 's'} survived  ×  ${COINS_PER_SURVIVOR} = ${survivors * COINS_PER_SURVIVOR} coins`);
      lines.push(`Win bonus: +${WIN_BONUS_COINS} coins`);
      lines.push(`Total earned: +${reward} coins`);
    } else {
      lines.push('Your last card fell.');
    }
    if (lostCount > 0) {
      lines.push(`Cards lost forever: ${lostCount}`);
    } else {
      lines.push(`No cards lost — clean sweep!`);
    }
    this.add.text(GAME_W / 2, 260, lines.join('\n'), {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#fff', align: 'center',
    }).setOrigin(0.5);

    makeButton(this, GAME_W / 2, GAME_H - 80, 240, 56, 'Back to Hub', () => {
      this.scene.start('HubScene');
    }, { fill: 0x2e7d32, fillHover: 0x43a047, fontSize: 20 });
  }

  forfeit() {
    if (this.endedBattle) return;
    this.endedBattle = true;
    // Forfeiting still loses the cards that died.
    const dead = this.battle.playerCards.filter((c) => c.dead);
    const lostByMonster = new Map();
    for (const c of dead) {
      lostByMonster.set(c.monsterId, (lostByMonster.get(c.monsterId) ?? 0) + 1);
    }
    for (const [id, n] of lostByMonster) removeMonster(this.registry, id, n);
    this.scene.start('HubScene');
  }
}

