// drawMonster(g, monster, size) — draws into a Phaser.GameObjects.Graphics centered at (0,0).
// `monster` is an entry from MONSTERS (we read .art and .name).
// `size` is the body diameter in px. Caller is responsible for positioning the Graphics.

import Phaser from 'phaser';

export function drawMonster(g, monster, size = 200) {
  const a = monster.art;
  g.clear();
  const r = size / 2;

  // Drop shadow under the monster
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(0, r * 0.95, size * 0.8, size * 0.18);

  // Body
  drawBody(g, a, size);

  // Accent spots / spikes
  drawAccent(g, a, size);

  // Horns (over body, behind eyes)
  drawHorns(g, a, size);

  // Eyes
  drawEyes(g, a, size);

  // Mouth
  drawMouth(g, a, size);
}

function drawBody(g, a, size) {
  const r = size / 2;
  g.fillStyle(a.bodyColor, 1);

  if (a.body === 'blob') {
    g.fillEllipse(0, 0, size, size * 0.95);
  } else if (a.body === 'slime') {
    // Rounded top, wavy/flat-ish bottom
    g.fillEllipse(0, -size * 0.05, size, size * 0.95);
    // Wavy drips
    g.fillCircle(-r * 0.55, r * 0.4, r * 0.18);
    g.fillCircle( r * 0.55, r * 0.45, r * 0.15);
    g.fillRect(-r * 0.8, -size * 0.05, size * 0.8, r * 0.5);
  } else if (a.body === 'beast') {
    // Body + ear triangles
    g.fillEllipse(0, 0, size, size * 0.95);
    g.fillTriangle(-r * 0.8, -r * 0.55, -r * 0.4, -r * 0.95, -r * 0.25, -r * 0.5);
    g.fillTriangle( r * 0.8, -r * 0.55,  r * 0.4, -r * 0.95,  r * 0.25, -r * 0.5);
  } else if (a.body === 'wisp') {
    // Teardrop: round bottom, tapered top
    g.fillEllipse(0, r * 0.1, size * 0.95, size * 0.85);
    g.fillTriangle(-r * 0.45, -r * 0.2, r * 0.45, -r * 0.2, 0, -r * 1.15);
  } else {
    g.fillEllipse(0, 0, size, size * 0.95);
  }
}

function drawAccent(g, a, size) {
  const r = size / 2;
  g.fillStyle(a.accent, 1);
  if (a.body === 'slime') {
    g.fillEllipse(-r * 0.35, -r * 0.4, size * 0.25, size * 0.12);
  } else if (a.body === 'blob') {
    g.fillCircle(-r * 0.5, r * 0.2, r * 0.12);
    g.fillCircle( r * 0.45, r * 0.0, r * 0.10);
  } else if (a.body === 'beast') {
    // Belly patch
    g.fillEllipse(0, r * 0.35, size * 0.45, size * 0.3);
  } else if (a.body === 'wisp') {
    g.fillCircle(0, -r * 0.7, r * 0.08);
    g.fillCircle(-r * 0.2, -r * 0.5, r * 0.06);
    g.fillCircle( r * 0.2, -r * 0.4, r * 0.06);
  }
}

function drawHorns(g, a, size) {
  if (!a.horns) return;
  const r = size / 2;
  g.fillStyle(0xffffff, 1);
  g.fillStyle(0x4e342e, 1);
  if (a.horns >= 1) {
    g.fillTriangle(-r * 0.55, -r * 0.75, -r * 0.35, -r * 0.75, -r * 0.45, -r * 1.2);
  }
  if (a.horns >= 2) {
    g.fillTriangle( r * 0.55, -r * 0.75,  r * 0.35, -r * 0.75,  r * 0.45, -r * 1.2);
  }
}

function drawEyes(g, a, size) {
  const n = a.eyes ?? 2;
  if (n <= 0) return;
  const r = size / 2;
  const eyeR = r * (n === 1 ? 0.22 : n === 2 ? 0.16 : 0.11);
  const y = -r * 0.1;
  const spread = r * 0.5;

  for (let i = 0; i < n; i++) {
    let x;
    if (n === 1) x = 0;
    else x = Phaser.Math.Linear(-spread, spread, i / (n - 1));
    // Sclera
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x, y, eyeR);
    // Pupil
    g.fillStyle(a.eyeColor, 1);
    g.fillCircle(x, y, eyeR * 0.55);
    // Highlight
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x - eyeR * 0.25, y - eyeR * 0.25, eyeR * 0.18);
  }
}

function drawMouth(g, a, size) {
  const r = size / 2;
  const y = r * 0.35;
  if (a.mouth === 'smile') {
    g.lineStyle(Math.max(2, size * 0.025), 0x111111, 1);
    g.beginPath();
    g.arc(0, y - r * 0.05, r * 0.28, Phaser.Math.DegToRad(10), Phaser.Math.DegToRad(170));
    g.strokePath();
  } else if (a.mouth === 'flat') {
    g.lineStyle(Math.max(2, size * 0.025), 0x111111, 1);
    g.lineBetween(-r * 0.2, y, r * 0.2, y);
  } else if (a.mouth === 'fangs') {
    g.fillStyle(0x000000, 1);
    g.fillEllipse(0, y, r * 0.5, r * 0.22);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(-r * 0.18, y - r * 0.05, -r * 0.08, y - r * 0.05, -r * 0.13, y + r * 0.12);
    g.fillTriangle( r * 0.18, y - r * 0.05,  r * 0.08, y - r * 0.05,  r * 0.13, y + r * 0.12);
  } else if (a.mouth === 'oh') {
    g.fillStyle(0x111111, 1);
    g.fillEllipse(0, y, r * 0.22, r * 0.3);
  }
}

// Renders a monster portrait into a Phaser.GameObjects.RenderTexture-style canvas.
// scene + (x, y) are where the texture will live; size is body diameter.
// Returns a Phaser.GameObjects.Container holding the Graphics so the caller can move it.
export function createMonsterPortrait(scene, monster, size = 200) {
  const c = scene.add.container(0, 0);
  const g = scene.add.graphics();
  drawMonster(g, monster, size);
  c.add(g);
  return c;
}
