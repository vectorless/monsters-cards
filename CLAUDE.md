# Monsters Cards (prototype)

Collect monster cards. Play minigames to earn coins, spend coins on packs, fill the Dex.

## Loop (v1)

1. **HubScene** — main menu with Minigames / Open Packs / Monster Dex buttons + coin counter.
2. **JigsawScene** (the one v1 minigame) — drag 4 puzzle pieces into a 2×2 board. Solve → +5 coins.
3. **ShopScene** — 5 themed packs (Forest, Fire, Ocean, Shadow, Cosmic). 10 coins each. 5 cards per pack.
4. **PackOpenScene** — reveals the 5 drawn cards left→right. Rare+ cards get a sparkle burst.
5. **DexScene** — grid of all monsters by pack. Owned shows art + ×count badge; unowned shows silhouette.

## Rarities

`common` (50) → `uncommon` (25) → `rare` (12) → `epic` (7) → `legendary` (4) → `secret` (1.5) → `godlike` (0.5).
Slot 4 of a pack rerolls until ≥ uncommon; slot 5 until ≥ rare (guaranteed hit per pack).

## Hotkeys

None yet — pointer/mouse driven.

## Architecture invariants — keep these

- **Phaser scenes are modes.** `HubScene` is the hub. `ShopScene`, `MinigameSelectScene`, `DexScene` launch as overlays (Hub paused, not stopped). `PackOpenScene` overlays `ShopScene`. `JigsawScene` runs full-screen and returns to `HubScene` via `scene.start`.
- **Game state lives on `scene.registry`** — `coins`, `coinsEarnedTotal`, `monsters` (id → { count }), `lastPackOpened`. All mutators in `src/state.js`. Never `registry.set` from a scene.
- **Content is data, not classes.** `src/data/{rarities,packs,monsters}.js` are keyed objects + `*_ORDER` arrays. Add a monster by tweaking these.
- **Monster art is procedural.** `src/render/monsterArt.js` draws bodies/eyes/horns/mouth from data params. No image assets in v1.
- **Controllers separated from scenes.** `JigsawController` owns piece state and snap logic; `JigsawScene` just renders + wires input.
- **Rarity color is for the card frame, not the body.** Body colors come from the monster's own art data.

## Run

```
npm install
npm run dev
```

Vite binds 127.0.0.1:5173.

## Deferred (not in v1)

Save/load, more minigames, duplicate-refund, animations on hub, audio, mobile/touch tuning, animations on pack tear, special "guaranteed legendary" packs, monster stats/battle.
