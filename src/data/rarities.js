export const RARITIES = {
  common:    { color: 0xb0b0b0, weight: 75,    label: 'Common' },
  uncommon:  { color: 0x4caf50, weight: 18,    label: 'Uncommon' },
  rare:      { color: 0x2196f3, weight: 5,     label: 'Rare' },
  epic:      { color: 0x9c27b0, weight: 1.5,   label: 'Epic' },
  legendary: { color: 0xff9800, weight: 0.4,   label: 'Legendary' },
  secret:    { color: 0xe91e63, weight: 0.08,  label: 'Secret' },
  godlike:   { color: 0xffd54a, weight: 0.02,  label: 'Godlike' },
};

export const RARITY_ORDER = [
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'secret', 'godlike',
];

export function rarityRank(r) {
  return RARITY_ORDER.indexOf(r);
}

export function rollRarity(minIndex = 0) {
  const pool = RARITY_ORDER.slice(minIndex);
  const total = pool.reduce((s, r) => s + RARITIES[r].weight, 0);
  let n = Math.random() * total;
  for (const r of pool) {
    n -= RARITIES[r].weight;
    if (n <= 0) return r;
  }
  return pool[pool.length - 1];
}
