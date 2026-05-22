// All monsters keyed by id. art params drive procedural rendering in src/render/monsterArt.js.
// Body shapes: 'blob' | 'slime' | 'beast' | 'wisp'
// Mouths: 'smile' | 'fangs' | 'flat' | 'oh'

export const MONSTERS = {
  // ───── FOREST ─────
  m_forest_mossling:   { name: 'Mossling',     packId: 'forest', rarity: 'common',
    art: { body: 'blob',  bodyColor: 0x6bbf59, eyes: 2, eyeColor: 0x111, mouth: 'smile', horns: 0, accent: 0x3e8e41 } },
  m_forest_acorn:      { name: 'Acornite',     packId: 'forest', rarity: 'common',
    art: { body: 'beast', bodyColor: 0x8d6e63, eyes: 2, eyeColor: 0x111, mouth: 'flat',  horns: 0, accent: 0xa1887f } },
  m_forest_fern:       { name: 'Fernlet',      packId: 'forest', rarity: 'common',
    art: { body: 'slime', bodyColor: 0x9ccc65, eyes: 1, eyeColor: 0x111, mouth: 'smile', horns: 0, accent: 0x558b2f } },
  m_forest_vinepup:    { name: 'Vinepup',      packId: 'forest', rarity: 'uncommon',
    art: { body: 'beast', bodyColor: 0x33691e, eyes: 2, eyeColor: 0xffeb3b, mouth: 'fangs', horns: 1, accent: 0x8bc34a } },
  m_forest_mushcap:    { name: 'Mushcap',      packId: 'forest', rarity: 'uncommon',
    art: { body: 'blob',  bodyColor: 0xe57373, eyes: 2, eyeColor: 0x111, mouth: 'oh',    horns: 0, accent: 0xfff8e1 } },
  m_forest_thornfox:   { name: 'Thornfox',     packId: 'forest', rarity: 'rare',
    art: { body: 'beast', bodyColor: 0x4e342e, eyes: 2, eyeColor: 0xff5722, mouth: 'fangs', horns: 2, accent: 0xbcaaa4 } },
  m_forest_owlsage:    { name: 'Owlsage',      packId: 'forest', rarity: 'epic',
    art: { body: 'wisp',  bodyColor: 0x795548, eyes: 2, eyeColor: 0xffeb3b, mouth: 'flat',  horns: 0, accent: 0x4caf50 } },
  m_forest_treant:     { name: 'Old Treant',   packId: 'forest', rarity: 'legendary',
    art: { body: 'beast', bodyColor: 0x3e2723, eyes: 2, eyeColor: 0x66bb6a, mouth: 'fangs', horns: 2, accent: 0x33691e } },
  m_forest_greenghost: { name: 'Greenghost',   packId: 'forest', rarity: 'secret',
    art: { body: 'wisp',  bodyColor: 0xa5d6a7, eyes: 3, eyeColor: 0x000,  mouth: 'oh',    horns: 0, accent: 0xc8e6c9 } },
  m_forest_worldroot:  { name: 'Worldroot',    packId: 'forest', rarity: 'godlike',
    art: { body: 'beast', bodyColor: 0x1b5e20, eyes: 4, eyeColor: 0xffd54a, mouth: 'fangs', horns: 2, accent: 0xffd54a } },

  // ───── FIRE ─────
  m_fire_emberpup:     { name: 'Emberpup',     packId: 'fire',   rarity: 'common',
    art: { body: 'beast', bodyColor: 0xff7043, eyes: 2, eyeColor: 0xfff, mouth: 'smile', horns: 0, accent: 0xffab91 } },
  m_fire_sparkbug:     { name: 'Sparkbug',     packId: 'fire',   rarity: 'common',
    art: { body: 'blob',  bodyColor: 0xffb300, eyes: 2, eyeColor: 0x111, mouth: 'flat',  horns: 0, accent: 0xff6f00 } },
  m_fire_coalslime:    { name: 'Coalslime',    packId: 'fire',   rarity: 'common',
    art: { body: 'slime', bodyColor: 0x424242, eyes: 2, eyeColor: 0xff5722, mouth: 'smile', horns: 0, accent: 0xff7043 } },
  m_fire_lavadog:      { name: 'Lavadog',      packId: 'fire',   rarity: 'uncommon',
    art: { body: 'beast', bodyColor: 0xbf360c, eyes: 2, eyeColor: 0xffeb3b, mouth: 'fangs', horns: 1, accent: 0xff5722 } },
  m_fire_ashwing:      { name: 'Ashwing',      packId: 'fire',   rarity: 'uncommon',
    art: { body: 'wisp',  bodyColor: 0x616161, eyes: 2, eyeColor: 0xff7043, mouth: 'flat',  horns: 0, accent: 0xeceff1 } },
  m_fire_magmaw:       { name: 'Magmaw',       packId: 'fire',   rarity: 'rare',
    art: { body: 'blob',  bodyColor: 0xd84315, eyes: 1, eyeColor: 0xffeb3b, mouth: 'fangs', horns: 2, accent: 0xff8a65 } },
  m_fire_pyrokin:      { name: 'Pyrokin',      packId: 'fire',   rarity: 'epic',
    art: { body: 'beast', bodyColor: 0xff5722, eyes: 2, eyeColor: 0xfff, mouth: 'fangs', horns: 2, accent: 0xffd54a } },
  m_fire_phoenix:      { name: 'Phoenix',      packId: 'fire',   rarity: 'legendary',
    art: { body: 'wisp',  bodyColor: 0xffc107, eyes: 2, eyeColor: 0xd84315, mouth: 'flat',  horns: 0, accent: 0xff5722 } },
  m_fire_voidflame:    { name: 'Voidflame',    packId: 'fire',   rarity: 'secret',
    art: { body: 'wisp',  bodyColor: 0x1a1a1a, eyes: 3, eyeColor: 0xff5722, mouth: 'oh',    horns: 0, accent: 0xff7043 } },
  m_fire_sunheart:     { name: 'Sunheart',     packId: 'fire',   rarity: 'godlike',
    art: { body: 'blob',  bodyColor: 0xffd54a, eyes: 2, eyeColor: 0xbf360c, mouth: 'smile', horns: 2, accent: 0xff5722 } },

  // ───── OCEAN ─────
  m_ocean_bubblepup:   { name: 'Bubblepup',    packId: 'ocean',  rarity: 'common',
    art: { body: 'blob',  bodyColor: 0x4fc3f7, eyes: 2, eyeColor: 0x111, mouth: 'oh',    horns: 0, accent: 0xb3e5fc } },
  m_ocean_minnow:      { name: 'Minnowling',   packId: 'ocean',  rarity: 'common',
    art: { body: 'wisp',  bodyColor: 0x29b6f6, eyes: 2, eyeColor: 0x111, mouth: 'smile', horns: 0, accent: 0x4fc3f7 } },
  m_ocean_kelpie:      { name: 'Kelpie',       packId: 'ocean',  rarity: 'common',
    art: { body: 'slime', bodyColor: 0x00897b, eyes: 1, eyeColor: 0xfff, mouth: 'flat',  horns: 0, accent: 0x4db6ac } },
  m_ocean_starcrab:    { name: 'Starcrab',     packId: 'ocean',  rarity: 'uncommon',
    art: { body: 'beast', bodyColor: 0xff7043, eyes: 2, eyeColor: 0x111, mouth: 'fangs', horns: 2, accent: 0xfff176 } },
  m_ocean_jelly:       { name: 'Glowjelly',    packId: 'ocean',  rarity: 'uncommon',
    art: { body: 'wisp',  bodyColor: 0xe1bee7, eyes: 2, eyeColor: 0xab47bc, mouth: 'smile', horns: 0, accent: 0xf3e5f5 } },
  m_ocean_eelmage:     { name: 'Eel Mage',     packId: 'ocean',  rarity: 'rare',
    art: { body: 'wisp',  bodyColor: 0x1565c0, eyes: 2, eyeColor: 0xffeb3b, mouth: 'fangs', horns: 0, accent: 0x4fc3f7 } },
  m_ocean_krakling:    { name: 'Krakling',     packId: 'ocean',  rarity: 'epic',
    art: { body: 'blob',  bodyColor: 0x1a237e, eyes: 3, eyeColor: 0xffeb3b, mouth: 'oh',    horns: 0, accent: 0x3949ab } },
  m_ocean_levia:       { name: 'Levia',        packId: 'ocean',  rarity: 'legendary',
    art: { body: 'beast', bodyColor: 0x0d47a1, eyes: 2, eyeColor: 0xfff, mouth: 'fangs', horns: 2, accent: 0x4fc3f7 } },
  m_ocean_abyssal:     { name: 'Abyssal',      packId: 'ocean',  rarity: 'secret',
    art: { body: 'wisp',  bodyColor: 0x000a12, eyes: 4, eyeColor: 0x4fc3f7, mouth: 'fangs', horns: 0, accent: 0x01579b } },
  m_ocean_tidemother:  { name: 'Tidemother',   packId: 'ocean',  rarity: 'godlike',
    art: { body: 'beast', bodyColor: 0x006064, eyes: 2, eyeColor: 0xffd54a, mouth: 'smile', horns: 2, accent: 0x80deea } },

  // ───── SHADOW ─────
  m_shadow_imp:        { name: 'Tiny Imp',     packId: 'shadow', rarity: 'common',
    art: { body: 'blob',  bodyColor: 0x4527a0, eyes: 2, eyeColor: 0xff5722, mouth: 'fangs', horns: 2, accent: 0x7e57c2 } },
  m_shadow_bat:        { name: 'Nightbat',     packId: 'shadow', rarity: 'common',
    art: { body: 'wisp',  bodyColor: 0x311b92, eyes: 2, eyeColor: 0xfff176, mouth: 'fangs', horns: 0, accent: 0x5e35b1 } },
  m_shadow_blob:       { name: 'Inkblob',      packId: 'shadow', rarity: 'common',
    art: { body: 'slime', bodyColor: 0x1a1a2e, eyes: 1, eyeColor: 0xfff, mouth: 'smile', horns: 0, accent: 0x4527a0 } },
  m_shadow_wraith:     { name: 'Wraithlet',    packId: 'shadow', rarity: 'uncommon',
    art: { body: 'wisp',  bodyColor: 0x37474f, eyes: 2, eyeColor: 0xb39ddb, mouth: 'oh',    horns: 0, accent: 0x9575cd } },
  m_shadow_houndling:  { name: 'Houndling',    packId: 'shadow', rarity: 'uncommon',
    art: { body: 'beast', bodyColor: 0x212121, eyes: 2, eyeColor: 0xef5350, mouth: 'fangs', horns: 1, accent: 0x673ab7 } },
  m_shadow_witchcat:   { name: 'Witchcat',     packId: 'shadow', rarity: 'rare',
    art: { body: 'beast', bodyColor: 0x4527a0, eyes: 2, eyeColor: 0x76ff03, mouth: 'smile', horns: 2, accent: 0x9c27b0 } },
  m_shadow_lichling:   { name: 'Lichling',     packId: 'shadow', rarity: 'epic',
    art: { body: 'wisp',  bodyColor: 0x263238, eyes: 2, eyeColor: 0x00e5ff, mouth: 'fangs', horns: 2, accent: 0x7e57c2 } },
  m_shadow_nightlord:  { name: 'Night Lord',   packId: 'shadow', rarity: 'legendary',
    art: { body: 'beast', bodyColor: 0x1a1a2e, eyes: 2, eyeColor: 0xd32f2f, mouth: 'fangs', horns: 2, accent: 0x9c27b0 } },
  m_shadow_void:       { name: 'The Void',     packId: 'shadow', rarity: 'secret',
    art: { body: 'blob',  bodyColor: 0x000000, eyes: 3, eyeColor: 0xab47bc, mouth: 'oh',    horns: 0, accent: 0x6a1b9a } },
  m_shadow_endking:    { name: 'End King',     packId: 'shadow', rarity: 'godlike',
    art: { body: 'beast', bodyColor: 0x4a148c, eyes: 2, eyeColor: 0xffd54a, mouth: 'fangs', horns: 2, accent: 0xffd54a } },

  // ───── COSMIC ─────
  m_cosmic_starlet:    { name: 'Starlet',      packId: 'cosmic', rarity: 'common',
    art: { body: 'blob',  bodyColor: 0xffd54a, eyes: 2, eyeColor: 0x111, mouth: 'smile', horns: 0, accent: 0xfff59d } },
  m_cosmic_moonpup:    { name: 'Moonpup',      packId: 'cosmic', rarity: 'common',
    art: { body: 'beast', bodyColor: 0xe0e0e0, eyes: 2, eyeColor: 0x311b92, mouth: 'smile', horns: 1, accent: 0xbdbdbd } },
  m_cosmic_dustsprite: { name: 'Dustsprite',   packId: 'cosmic', rarity: 'common',
    art: { body: 'wisp',  bodyColor: 0xb39ddb, eyes: 2, eyeColor: 0xfff, mouth: 'oh',    horns: 0, accent: 0xd1c4e9 } },
  m_cosmic_cometkit:   { name: 'Cometkit',     packId: 'cosmic', rarity: 'uncommon',
    art: { body: 'beast', bodyColor: 0x29b6f6, eyes: 2, eyeColor: 0xffd54a, mouth: 'fangs', horns: 1, accent: 0xfff176 } },
  m_cosmic_nebula:     { name: 'Nebula Drop',  packId: 'cosmic', rarity: 'uncommon',
    art: { body: 'slime', bodyColor: 0xab47bc, eyes: 2, eyeColor: 0xfff176, mouth: 'smile', horns: 0, accent: 0xe1bee7 } },
  m_cosmic_voyager:    { name: 'Voyager',      packId: 'cosmic', rarity: 'rare',
    art: { body: 'wisp',  bodyColor: 0x6a1b9a, eyes: 2, eyeColor: 0xffd54a, mouth: 'flat',  horns: 0, accent: 0xb39ddb } },
  m_cosmic_quasarcat:  { name: 'Quasarcat',    packId: 'cosmic', rarity: 'epic',
    art: { body: 'beast', bodyColor: 0x4a148c, eyes: 2, eyeColor: 0xffeb3b, mouth: 'fangs', horns: 2, accent: 0xffd54a } },
  m_cosmic_pulsar:     { name: 'Pulsar',       packId: 'cosmic', rarity: 'legendary',
    art: { body: 'blob',  bodyColor: 0xfff176, eyes: 2, eyeColor: 0x4a148c, mouth: 'oh',    horns: 0, accent: 0xffd54a } },
  m_cosmic_blackhole:  { name: 'Hole-in-Sky',  packId: 'cosmic', rarity: 'secret',
    art: { body: 'blob',  bodyColor: 0x000000, eyes: 1, eyeColor: 0xffd54a, mouth: 'oh',    horns: 0, accent: 0x4a148c } },
  m_cosmic_universe:   { name: 'The Universe', packId: 'cosmic', rarity: 'godlike',
    art: { body: 'wisp',  bodyColor: 0x1a237e, eyes: 4, eyeColor: 0xffd54a, mouth: 'smile', horns: 2, accent: 0xffd54a } },
};

export const MONSTER_IDS = Object.keys(MONSTERS);

export function monstersInPack(packId) {
  return MONSTER_IDS.filter((id) => MONSTERS[id].packId === packId);
}

export function monstersInPackByRarity(packId, rarity) {
  return MONSTER_IDS.filter(
    (id) => MONSTERS[id].packId === packId && MONSTERS[id].rarity === rarity,
  );
}
