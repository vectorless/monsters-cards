import { MONSTERS, monstersInPackByRarity, monstersInPack } from './data/monsters.js';
import { rollRarity, RARITY_ORDER, rarityRank } from './data/rarities.js';
import { PACK_COST } from './data/packs.js';

const STORAGE_KEY = 'monsters-cards:v1';
const STARTER_ENERGY_CARDS = 3;

function saveState(registry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      coins: registry.get('coins') ?? 0,
      coinsEarnedTotal: registry.get('coinsEarnedTotal') ?? 0,
      monsters: registry.get('monsters') ?? {},
      energyCards: registry.get('energyCards') ?? 0,
    }));
  } catch (_) { /* private mode / quota — silently skip */ }
}

function loadState(registry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (typeof d.coins === 'number') registry.set('coins', d.coins);
    if (typeof d.coinsEarnedTotal === 'number') registry.set('coinsEarnedTotal', d.coinsEarnedTotal);
    if (d.monsters && typeof d.monsters === 'object') {
      const filtered = {};
      for (const id of Object.keys(d.monsters)) {
        if (MONSTERS[id]) filtered[id] = d.monsters[id];
      }
      registry.set('monsters', filtered);
    }
    if (typeof d.energyCards === 'number') {
      registry.set('energyCards', d.energyCards);
    }
    // else: keep STARTER_ENERGY_CARDS from initState, so legacy saves get the starter grant.
  } catch (_) { /* corrupt save — ignore, defaults stand */ }
}

export function initState(registry) {
  if (registry.get('initialized')) return;
  registry.set('initialized', true);
  registry.set('coins', 0);
  registry.set('coinsEarnedTotal', 0);
  registry.set('monsters', {}); // id -> { count }
  registry.set('energyCards', STARTER_ENERGY_CARDS);
  registry.set('lastPackOpened', null);
  loadState(registry);
}

export function resetSave(registry) {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  registry.set('coins', 0);
  registry.set('coinsEarnedTotal', 0);
  registry.set('monsters', {});
  registry.set('energyCards', STARTER_ENERGY_CARDS);
  registry.set('lastPackOpened', null);
}

export function getCoins(registry) {
  return registry.get('coins') ?? 0;
}

export function addCoins(registry, n) {
  const c = (registry.get('coins') ?? 0) + n;
  registry.set('coins', c);
  if (n > 0) {
    registry.set('coinsEarnedTotal', (registry.get('coinsEarnedTotal') ?? 0) + n);
  }
  saveState(registry);
  return c;
}

export function getOwned(registry) {
  return registry.get('monsters') ?? {};
}

export function ownedCount(registry, id) {
  return (getOwned(registry)[id]?.count) ?? 0;
}

export function addMonster(registry, id) {
  const owned = { ...(registry.get('monsters') ?? {}) };
  const cur = owned[id] ?? { count: 0 };
  owned[id] = { count: cur.count + 1 };
  registry.set('monsters', owned);
  saveState(registry);
  return owned[id].count;
}

// Decrement a monster's count by n. Removes the entry when count hits 0.
// Used when a card dies in battle (permanent loss).
export function removeMonster(registry, id, n = 1) {
  const owned = { ...(registry.get('monsters') ?? {}) };
  const cur = owned[id];
  if (!cur) return 0;
  const next = Math.max(0, cur.count - n);
  if (next === 0) delete owned[id];
  else owned[id] = { count: next };
  registry.set('monsters', owned);
  saveState(registry);
  return next;
}

// Total cards owned counting duplicates.
export function totalCardsOwned(registry) {
  const owned = getOwned(registry);
  return Object.values(owned).reduce((s, v) => s + (v?.count ?? 0), 0);
}

// Expand the owned map into an array of monster ids (one per copy).
// Useful when seeding a battle deck.
export function expandedOwnedIds(registry) {
  const owned = getOwned(registry);
  const out = [];
  for (const [id, v] of Object.entries(owned)) {
    for (let i = 0; i < (v?.count ?? 0); i++) out.push(id);
  }
  return out;
}

export function uniqueOwnedIn(registry, packId) {
  const owned = getOwned(registry);
  return Object.keys(owned).filter((id) => MONSTERS[id]?.packId === packId).length;
}

// Returns array of 5 monster ids, sorted worst → best (rarest last for reveal drama).
// Only floor: the last slot is guaranteed ≥ uncommon so a pack never feels worthless.
export function drawPack(packId) {
  const ids = [];
  for (let i = 0; i < 5; i++) {
    const minRank = i === 4 ? rarityRank('uncommon') : 0;

    let id = null;
    for (let attempt = 0; attempt < 12 && !id; attempt++) {
      const rarity = rollRarity(minRank);
      const pool = monstersInPackByRarity(packId, rarity);
      if (pool.length) id = pool[Math.floor(Math.random() * pool.length)];
    }
    if (!id) {
      const pool = monstersInPack(packId);
      id = pool[Math.floor(Math.random() * pool.length)];
    }
    ids.push(id);
  }
  // Worst → best so reveal saves the rarest for the final tap.
  ids.sort((a, b) => rarityRank(MONSTERS[a].rarity) - rarityRank(MONSTERS[b].rarity));
  return ids;
}

export function getEnergyCards(registry) {
  return registry.get('energyCards') ?? 0;
}

export function addEnergyCards(registry, n) {
  const c = (registry.get('energyCards') ?? 0) + n;
  registry.set('energyCards', c);
  saveState(registry);
  return c;
}

export function tryOpenPack(registry, packId) {
  if ((registry.get('coins') ?? 0) < PACK_COST) return null;
  addCoins(registry, -PACK_COST);
  const draws = drawPack(packId);
  for (const id of draws) addMonster(registry, id);
  // Every pack guarantees +1 energy card.
  addEnergyCards(registry, 1);
  registry.set('lastPackOpened', { packId, draws });
  return draws;
}

export function rarestOwnedMonsterId(registry) {
  const owned = getOwned(registry);
  const ids = Object.keys(owned);
  if (!ids.length) return null;
  ids.sort((a, b) => rarityRank(MONSTERS[b].rarity) - rarityRank(MONSTERS[a].rarity));
  return ids[0];
}

export function randomOwnedMonsterId(registry) {
  const ids = Object.keys(getOwned(registry));
  if (!ids.length) return null;
  return ids[Math.floor(Math.random() * ids.length)];
}
