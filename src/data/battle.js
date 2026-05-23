// Battle balance constants. Stats are derived from monster rarity so we don't
// have to hand-author hp/dmg on each monster entry.

// dmg scales with rarity (uncapped) and so does the per-attack energy surcharge
// — better cards hit harder but cost more energy to swing.
export const STATS_BY_RARITY = {
  common:    { hp: 40,  dmg: 20,  extraEnergy: 0 },
  uncommon:  { hp: 65,  dmg: 35,  extraEnergy: 0 },
  rare:      { hp: 100, dmg: 55,  extraEnergy: 1 },
  epic:      { hp: 160, dmg: 80,  extraEnergy: 1 },
  legendary: { hp: 240, dmg: 120, extraEnergy: 2 },
  secret:    { hp: 340, dmg: 170, extraEnergy: 2 },
  godlike:   { hp: 480, dmg: 240, extraEnergy: 3 },
};

// Damage = round(attacker.dmg * multiplier). Energy = base + rarity surcharge.
export const ATTACKS = [
  { id: 'quick', label: 'Quick Strike', energy: 1, multiplier: 1.0, color: 0x4caf50 },
  { id: 'heavy', label: 'Heavy Blow',   energy: 2, multiplier: 2.5, color: 0xe53935 },
];

export const ENERGY_PER_TURN = 3;          // opponent energy budget per turn
export const ENERGY_CAP = 5;                // max energy a player can have, no matter how many cards
export const MIN_DECK_SIZE = 20;

// Player's per-turn energy = clamp(energyCardsOwned, 1, ENERGY_CAP).
// At least 1 so a fresh player can still attack.
export function playerEnergyMax(energyCardsOwned) {
  return Math.max(1, Math.min(ENERGY_CAP, energyCardsOwned));
}
export const COINS_PER_SURVIVOR = 5;
export const WIN_BONUS_COINS = 20;

export function statsFor(monster) {
  return STATS_BY_RARITY[monster.rarity] ?? STATS_BY_RARITY.common;
}

export function attackDamage(attack, attackerMonster) {
  return Math.round(statsFor(attackerMonster).dmg * attack.multiplier);
}

export function attackEnergyCost(attack, attackerMonster) {
  return attack.energy + (statsFor(attackerMonster).extraEnergy ?? 0);
}

export function findAttack(id) {
  return ATTACKS.find((a) => a.id === id);
}
