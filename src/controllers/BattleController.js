import { MONSTERS, MONSTER_IDS } from '../data/monsters.js';
import { rarityRank } from '../data/rarities.js';
import {
  ATTACKS, ENERGY_PER_TURN,
  statsFor, attackDamage, attackEnergyCost,
} from '../data/battle.js';

// A battle "card" is an instance with its own HP.
// monsterId can repeat across instances (player brought 3 copies of Mossling).
function mkCard(monsterId, prefix, idx) {
  const m = MONSTERS[monsterId];
  const s = statsFor(m);
  return {
    instanceId: `${prefix}${idx}`,
    monsterId,
    monster: m,
    maxHp: s.hp,
    hp: s.hp,
    dead: false,
  };
}

export class BattleController {
  constructor({ playerDeckIds, opponentDeckIds, playerMaxEnergy = ENERGY_PER_TURN, opponentMaxEnergy = ENERGY_PER_TURN }) {
    this.playerCards   = playerDeckIds.map((id, i) => mkCard(id, 'p', i));
    this.opponentCards = opponentDeckIds.map((id, i) => mkCard(id, 'o', i));
    this.playerMaxEnergy = playerMaxEnergy;
    this.opponentMaxEnergy = opponentMaxEnergy;
    // Energy starts at 0; the +1-per-turn gain happens in startPlayerTurn /
    // endPlayerTurn (which begins the opponent's turn).
    this.playerEnergy = 0;
    this.opponentEnergy = 0;
    this.turn = 'player';
    this.log = [];
    // Apply the turn-1 gain so the player has 1 energy on their opening turn.
    this.startPlayerTurn();
  }

  get playerActive()   { return this.playerCards.find((c) => !c.dead); }
  get opponentActive() { return this.opponentCards.find((c) => !c.dead); }

  alive(side) {
    return (side === 'player' ? this.playerCards : this.opponentCards)
      .filter((c) => !c.dead).length;
  }

  isOver() {
    return this.alive('player') === 0 || this.alive('opponent') === 0;
  }

  winner() {
    if (this.alive('opponent') === 0 && this.alive('player') > 0) return 'player';
    if (this.alive('player') === 0)   return 'opponent';
    return null;
  }

  pushLog(text) {
    this.log.push(text);
    if (this.log.length > 6) this.log.shift();
  }

  // Returns { damage, target, killed } or null if not enough energy / no targets.
  playerAttack(attackId) {
    if (this.turn !== 'player') return null;
    const attack = ATTACKS.find((a) => a.id === attackId);
    if (!attack) return null;
    const attacker = this.playerActive;
    const target = this.opponentActive;
    if (!attacker || !target) return null;
    const cost = attackEnergyCost(attack, attacker.monster);
    if (this.playerEnergy < cost) return null;

    const dmg = attackDamage(attack, attacker.monster);
    target.hp = Math.max(0, target.hp - dmg);
    this.playerEnergy -= cost;
    const killed = target.hp === 0;
    if (killed) target.dead = true;

    this.pushLog(`${attacker.monster.name} used ${attack.label} (${dmg} dmg)${killed ? ` — KO'd ${target.monster.name}!` : ''}`);
    return { attacker, target, attack, damage: dmg, killed };
  }

  endPlayerTurn() {
    if (this.turn !== 'player') return;
    this.turn = 'opponent';
    // Opponent gains their turn's energy.
    this.opponentEnergy = Math.min(this.opponentMaxEnergy, this.opponentEnergy + 1);
  }

  // Plan the opponent's turn as a list of attack events for the scene to animate.
  // Greedy: max damage per energy spent, never wastes energy on a target with HP=0.
  planOpponentTurn() {
    const actions = [];
    let energy = this.opponentEnergy;
    const attacker = this.opponentActive;
    const target = this.playerActive;
    if (!attacker || !target) { this.opponentEnergy = energy; return actions; }

    const damageOf = (atk) => attackDamage(atk, attacker.monster);
    const costOf = (atk) => attackEnergyCost(atk, attacker.monster);
    const sorted = [...ATTACKS].sort((a, b) => damageOf(b) - damageOf(a));

    while (energy > 0 && target.hp > 0) {
      const pick = sorted.find((a) => costOf(a) <= energy);
      if (!pick) break;
      actions.push({
        attackId: pick.id,
        damage: damageOf(pick),
        targetInstanceId: target.instanceId,
      });
      target.hp = Math.max(0, target.hp - damageOf(pick));
      energy -= costOf(pick);
      if (target.hp === 0) break;
    }
    // Unused energy carries over to opponent's next turn.
    this.opponentEnergy = energy;
    return actions;
  }

  // Apply one queued opponent action (the scene calls this between animations).
  // Mutates target HP/dead, logs the message, returns { killed }.
  applyOpponentAction(action) {
    const attacker = this.opponentActive;
    const target = this.playerCards.find((c) => c.instanceId === action.targetInstanceId);
    if (!attacker || !target) return { killed: false };
    // Note: HP was already simulated down to 0 if needed in planOpponentTurn,
    // so re-applying the same damage gives the same result. Recompute correctly.
    const attack = ATTACKS.find((a) => a.id === action.attackId);
    // We intentionally trust the planned damage so simulated state matches view.
    const dmg = action.damage;
    target.hp = Math.max(0, target.hp - dmg);
    const killed = target.hp === 0 && !target.dead;
    if (killed) target.dead = true;
    this.pushLog(`${attacker.monster.name} used ${attack.label} (${dmg} dmg)${killed ? ` — KO'd your ${target.monster.name}!` : ''}`);
    return { killed, target, dmg };
  }

  // CAREFUL: planOpponentTurn mutates target.hp to simulate. Rewind so the
  // BattleScene can drive the animations with the real starting HP and apply
  // damage one-by-one.
  prepareAndApplyOpponentTurn() {
    // Snapshot real HP of player cards before planning.
    const snap = this.playerCards.map((c) => ({ instanceId: c.instanceId, hp: c.hp, dead: c.dead }));
    const actions = this.planOpponentTurn();
    // Restore from snapshot so animations apply damage incrementally.
    for (const s of snap) {
      const c = this.playerCards.find((p) => p.instanceId === s.instanceId);
      c.hp = s.hp;
      c.dead = s.dead;
    }
    return actions;
  }

  startPlayerTurn() {
    this.turn = 'player';
    // Gain 1 energy this turn (capped at max). Unused energy carries over.
    this.playerEnergy = Math.min(this.playerMaxEnergy, this.playerEnergy + 1);
  }
}

// Build a 20-card opponent deck using the same rarity weights as packs but spread
// across all themes. Uses a controlled rarity distribution so it's not pure RNG.
const OPPONENT_RARITY_PLAN = [
  // 11 commons, 5 uncommons, 3 rares, 1 epic — roughly mirrors a slightly above-
  // average player who has ground enough packs to enter battle.
  'common', 'common', 'common', 'common', 'common', 'common', 'common', 'common', 'common', 'common', 'common',
  'uncommon', 'uncommon', 'uncommon', 'uncommon', 'uncommon',
  'rare', 'rare', 'rare',
  'epic',
];

export function buildOpponentDeck() {
  return OPPONENT_RARITY_PLAN.map((rarity) => {
    const pool = MONSTER_IDS.filter((id) => MONSTERS[id].rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  });
}

// Sort a list of player-owned monster ids worst→best by rarity.
// Useful for default deck-builder ordering ("auto-pick weakest first" so rares
// stay home unless the player opts in).
export function sortOwnedByRarityAsc(ids) {
  return [...ids].sort((a, b) =>
    rarityRank(MONSTERS[a].rarity) - rarityRank(MONSTERS[b].rarity)
    || MONSTERS[a].name.localeCompare(MONSTERS[b].name));
}
