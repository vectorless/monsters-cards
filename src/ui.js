// Tiny UI helpers shared by scenes.
import Phaser from 'phaser';

export function makeButton(scene, x, y, w, h, label, onClick, opts = {}) {
  const fill = opts.fill ?? 0x3949ab;
  const fillHover = opts.fillHover ?? 0x5c6bc0;
  const fillDown = opts.fillDown ?? 0x283593;
  const textColor = opts.textColor ?? '#fff';
  const fontSize = opts.fontSize ?? Math.floor(h * 0.45);

  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, w, h, fill).setStrokeStyle(2, 0xffffff, 0.2);
  const t = scene.add.text(0, 0, label, {
    fontFamily: 'sans-serif', fontSize: `${fontSize}px`, color: textColor, fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add([bg, t]);

  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => bg.setFillStyle(fillHover));
  bg.on('pointerout',  () => bg.setFillStyle(fill));
  bg.on('pointerdown', () => bg.setFillStyle(fillDown));
  bg.on('pointerup',   () => {
    bg.setFillStyle(fillHover);
    onClick?.();
  });

  c.setEnabled = (enabled) => {
    if (enabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.setAlpha(1);
      t.setAlpha(1);
    } else {
      bg.disableInteractive();
      bg.setAlpha(0.4);
      t.setAlpha(0.6);
    }
  };
  c.label = t;
  c.bg = bg;
  c.setLabel = (text) => t.setText(text);
  return c;
}

export function makeCoinChip(scene, x, y, getCoinsFn) {
  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, 130, 38, 0x1a237e).setStrokeStyle(2, 0xffd54a, 0.9);
  const coin = scene.add.circle(-45, 0, 11, 0xffd54a).setStrokeStyle(2, 0xff8f00);
  const cs = scene.add.text(-45, 0, '$', { fontFamily: 'sans-serif', fontSize: '14px', color: '#5d4037', fontStyle: 'bold' }).setOrigin(0.5);
  const t = scene.add.text(0, 0, '0', { fontFamily: 'sans-serif', fontSize: '20px', color: '#ffd54a', fontStyle: 'bold' }).setOrigin(0, 0.5);
  c.add([bg, coin, cs, t]);
  c.refresh = () => { t.setText(String(getCoinsFn())); };
  c.refresh();
  return c;
}

export function drawCardFrame(scene, x, y, w, h, rarityColor) {
  const g = scene.add.graphics();
  g.fillStyle(0x0f1124, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
  g.lineStyle(4, rarityColor, 1);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
  return g;
}
