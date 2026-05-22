import Phaser from 'phaser';
import { initState } from './state.js';

// Surface runtime errors that would otherwise leave a frozen black canvas with
// no visible feedback. The banner is appended to <body>, not inside Phaser.
function showError(message) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;padding:10px 14px;font:13px monospace;z-index:9999;white-space:pre-wrap;';
  el.textContent = 'Runtime error: ' + message;
  document.body.appendChild(el);
}
window.addEventListener('error', (e) => showError(e.message + '\n' + (e.error?.stack ?? '')));
window.addEventListener('unhandledrejection', (e) => showError('unhandled rejection: ' + (e.reason?.stack ?? e.reason)));
import HubScene from './scenes/HubScene.js';
import ShopScene from './scenes/ShopScene.js';
import PackOpenScene from './scenes/PackOpenScene.js';
import MinigameSelectScene from './scenes/MinigameSelectScene.js';
import JigsawScene from './scenes/JigsawScene.js';
import DexScene from './scenes/DexScene.js';
import BattleDeckScene from './scenes/BattleDeckScene.js';
import BattleScene from './scenes/BattleScene.js';

export const GAME_W = 960;
export const GAME_H = 600;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#1a1d2e',
  scene: [HubScene, ShopScene, PackOpenScene, MinigameSelectScene, JigsawScene, DexScene, BattleDeckScene, BattleScene],
});

initState(game.registry);
