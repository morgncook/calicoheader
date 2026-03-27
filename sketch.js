let cols, rows;
let spacing = 14;
let margin = 42;
let cells = [];

const MOTION = 0.65;

// palette
const bg = "#050608";
const paperWhite = [236, 238, 233];
const chalk = [214, 220, 228];
const dim = [74, 80, 90];
const fog = [120, 126, 138];

const blue = [122, 170, 245];
const sky = [155, 196, 255];
const lime = [199, 214, 118];
const moss = [126, 144, 90];
const lilac = [193, 158, 206];
const rose = [186, 86, 126];
const coral = [232, 124, 84];
const amber = [218, 170, 92];

let patchRegions = [];
let stripBands = [];
let ghostBands = [];
let accentBlocks = [];
let backgroundZones = [];
let pigmentFields = [];
let activeClusters = [];
let anchorPoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CORNER);
  initSystem();
}

function initSystem() {
  cells = [];
  cols = floor((width - margin * 2) / spacing);
  rows = floor((height - margin * 2) / spacing);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      cells.push({
        gx,
        gy,
        x: margin + gx * spacing,
        y: margin + gy * spacing
      });
    }
  }

  buildPatchRegions();
  buildStripBands();
  buildGhostBands();
  buildAccentBlocks();
  buildBackgroundZones();
  buildPigmentFields();
  buildClusters();
  buildAnchors();
}

function draw() {
  drawBackgroundField();
  drawBackgroundZones();
  drawPigmentFields();
  drawBaseGrid();
  drawPigmentDots();
  drawPatchRegions();
  drawGhostBands();
  drawStripBands();
  drawAccentBlocks();
  drawClusterFields();
  drawLocalConnections();
  drawSeams();
  drawAnchors();
  drawDust();
}

// --------------------
// BACKGROUND
// --------------------

function drawBackgroundField() {
  background(bg);

  const t = frameCount * 0.004 * MOTION;

  for (let y = 0; y < height; y += 24) {
    for (let x = 0; x < width; x += 24) {
      let n1 = noise(x * 0.003, y * 0.003, t);
      let n2 = noise(x * 0.004 + 200, y * 0.004 + 50, t);
      let n3 = noise(x * 0.002 + 500, y * 0.002 + 120, t);

      let c;

      if (n1 > 0.66) {
        c = [18, 30, 48];
      } else if (n2 > 0.64) {
        c = [28, 20, 40];
      } else if (n3 > 0.68) {
        c = [20, 34, 28];
      } else {
        c = [8, 10, 14];
      }

      fill(c[0], c[1], c[2], 34);
      rect(x, y, 24, 24);
    }
  }
}

function buildBackgroundZones() {
  backgroundZones = [
    { x: width * 0.18, y: height * 0.22, r: 320, c: [24, 36, 60], a: 18, phase: random(1000) },
    { x: width * 0.68, y: height * 0.34, r: 380, c: [38, 22, 52], a: 16, phase: random(1000) },
    { x: width * 0.52, y: height * 0.78, r: 420, c: [28, 40, 24], a: 14, phase: random(1000) }
  ];
}

function drawBackgroundZones() {
  noStroke();

  for (const z of backgroundZones) {
    const t = frameCount * 0.006 * MOTION + z.phase;
    const dx = map(noise(t, z.phase), 0, 1, -10, 10);
    const dy = map(noise(z.phase, t), 0, 1, -10, 10);
    const rr = z.r * map(sin(t * 0.45), -1, 1, 0.99, 1.03);

    fill(z.c[0], z.c[1], z.c[2], z.a);
    circle(z.x + dx, z.y + dy, rr);
  }
}

function buildPigmentFields() {
  pigmentFields = [
    { x: width * 0.10, y: height * 0.18, w: width * 0.28, h: height * 0.09, c: blue, a: 9 },
    { x: width * 0.46, y: height * 0.17, w: width * 0.30, h: height * 0.08, c: sky, a: 8 },
    { x: width * 0.62, y: height * 0.68, w: width * 0.26, h: height * 0.14, c: lilac, a: 8 },
    { x: width * 0.08, y: height * 0.74, w: width * 0.30, h: height * 0.13, c: rose, a: 7 },
    { x: width * 0.32, y: height * 0.48, w: width * 0.24, h: height * 0.10, c: lime, a: 7 },
    { x: width * 0.74, y: height * 0.30, w: width * 0.18, h: height * 0.08, c: coral, a: 6 }
  ];
}

function drawPigmentFields() {
  noStroke();

  for (let i = 0; i < pigmentFields.length; i++) {
    const f = pigmentFields[i];
    const t = frameCount * 0.003 * MOTION + i * 100;
    const dx = map(noise(i * 10, t), 0, 1, -6, 6);
    const dy = map(noise(t, i * 20), 0, 1, -6, 6);

    fill(f.c[0], f.c[1], f.c[2], f.a);
    rect(f.x + dx, f.y + dy, f.w, f.h);
  }
}

// --------------------
// BASE GRID / PIGMENT
// --------------------

function drawBaseGrid() {
  for (const c of cells) {
    fill(dim[0], dim[1], dim[2], 26);
    rect(c.x - 0.9, c.y - 0.9, 1.8, 1.8);
  }
}

function drawPigmentDots() {
  const t = frameCount * 0.004 * MOTION;

  for (const c of cells) {
    let n = noise(c.gx * 0.08, c.gy * 0.08, t);

    if (n > 0.58) {
      let col;

      if (n > 0.84) col = blue;
      else if (n > 0.78) col = lilac;
      else if (n > 0.73) col = lime;
      else if (n > 0.68) col = coral;
      else if (n > 0.63) col = amber;
      else col = fog;

      let alpha = map(n, 0.58, 1.0, 8, 28);
      let size = map(n, 0.58, 1.0, 1.5, 3.4);

      fill(col[0], col[1], col[2], alpha);
      rect(c.x - size / 2, c.y - size / 2, size, size);
    }
  }
}

// --------------------
// BUILDERS
// --------------------

function buildPatchRegions() {
  patchRegions = [];

  const palette = [blue, blue, sky, lilac, lilac, lime, coral, amber, rose];
  let y = margin + random(20, 80);

  while (y < height - margin - 60) {
    const h = random([spacing * 3, spacing * 4, spacing * 5, spacing * 6]);
    let x = margin + random(0, 80);

    while (x < width - margin - 80) {
      const w = random([spacing * 4, spacing * 6, spacing * 8, spacing * 10, spacing * 12]);

      if (random() > 0.25) {
        patchRegions.push({
          x,
          y,
          w,
          h,
          color: random() > 0.35 ? random(palette) : fog,
          alpha: random(14, 34),
          mode: random(["fill", "cluster", "mixed"]),
          density: random(0.42, 0.84),
          phase: random(1020)
        });
      }

      x += w + random(spacing * 1, spacing * 3);
    }

    y += h + random(spacing * 1, spacing * 4);
  }
}

function buildStripBands() {
  stripBands = [];
  const palette = [blue, lilac, lime, coral, amber, sky, rose];

  let bandCount = floor(map(width, 900, 1800, 6, 11));

  for (let i = 0; i < bandCount; i++) {
    stripBands.push({
      x: random(margin, width * 0.45),
      y: random(margin + 30, height - margin - 30),
      w: random(width * 0.16, width * 0.34),
      h: random([4, 6, 8, 10]),
      color: random(palette),
      alpha: random(38, 82),
      fragments: floor(random(3, 7)),
      phase: random(1000)
    });
  }
}

function buildGhostBands() {
  ghostBands = [];

  for (let i = 0; i < 7; i++) {
    let vertical = random() > 0.78;

    ghostBands.push({
      vertical,
      x: random(margin, width - margin),
      y: random(margin, height - margin),
      len: vertical ? random(height * 0.1, height * 0.24) : random(width * 0.12, width * 0.28),
      thickness: random([2, 3, 4, 6]),
      alpha: random(8, 18),
      color: random([chalk, fog, paperWhite]),
      phase: random(1000)
    });
  }
}

function buildAccentBlocks() {
  accentBlocks = [];
  const palette = [blue, lilac, lime, coral, amber, sky, rose];

  let count = floor(map(width, 800, 1800, 7, 12));

  for (let i = 0; i < count; i++) {
    accentBlocks.push({
      x: random(margin, width - margin - spacing * 10),
      y: random(margin, height - margin - spacing * 6),
      w: random([spacing * 3, spacing * 4, spacing * 5]),
      h: random([spacing, spacing * 2, spacing * 3]),
      color: random(palette),
      alpha: random(60, 118),
      phase: random(1000)
    });
  }
}

function buildClusters() {
  activeClusters = [];

  let count = 3;
  for (let i = 0; i < count; i++) {
    activeClusters.push({
      x: random(width * 0.24, width * 0.76),
      y: random(height * 0.20, height * 0.80),
      r: random(80, 145),
      phase: random(1000),
      points: []
    });
  }
}

function buildAnchors() {
  anchorPoints = [];

  for (let i = 0; i < 10; i++) {
    anchorPoints.push({
      gx: floor(random(6, cols - 6)),
      gy: floor(random(6, rows - 6)),
      phase: random(1000)
    });
  }
}

// --------------------
// DRAWERS
// --------------------

function drawPatchRegions() {
  for (const r of patchRegions) {
    let t = frameCount * 0.003 * MOTION + r.phase;
    const regionJitterX = map(noise(r.phase, t), 0, 1, -1.2, 1.2);
    const regionJitterY = map(noise(t, r.phase), 0, 1, -1.0, 1.0);

    if (r.mode === "fill" || r.mode === "mixed") {
      fill(r.color[0], r.color[1], r.color[2], r.alpha * 0.24);
      rect(r.x + regionJitterX, r.y + regionJitterY, r.w, r.h);
    }

    for (const c of cells) {
      if (!insideRect(c.x, c.y, r.x, r.y, r.w, r.h)) continue;

      let n = noise(c.gx * 0.18 + t, c.gy * 0.18 - t * 0.6, r.phase * 0.001);
      if (n < r.density) continue;

      let localX = c.x + regionJitterX + map(noise(c.gx * 0.2, c.gy * 0.2, t), 0, 1, -1.4, 1.4);
      let localY = c.y + regionJitterY + map(noise(c.gx * 0.2 + 200, c.gy * 0.2, t), 0, 1, -1.2, 1.2);
      let intensity = map(n, r.density, 1, 0.25, 1);

      if (r.mode === "cluster" || (r.mode === "mixed" && randomFromCell(c.gx, c.gy, r.phase) > 0.45)) {
        if (randomFromCell(c.gx, c.gy, r.phase) > 0.58) {
          let size = map(intensity, 0.25, 1, 2.5, 7.5);
          fill(r.color[0], r.color[1], r.color[2], r.alpha + intensity * 55);
          rect(localX - size / 2, localY - size / 2, size, size);
        } else {
          let w = map(intensity, 0.25, 1, 4, 10);
          let h = map(intensity, 0.25, 1, 2, 3.5);
          fill(r.color[0], r.color[1], r.color[2], r.alpha + intensity * 36);
          rect(localX - w / 2, localY - h / 2, w, h);
        }
      }
    }
  }
}

function drawGhostBands() {
  for (const g of ghostBands) {
    let t = frameCount * 0.003 * MOTION + g.phase;
    fill(g.color[0], g.color[1], g.color[2], g.alpha);

    if (g.vertical) {
      let driftX = map(sin(t * 0.6), -1, 1, -2.5, 2.5);
      for (let i = 0; i < g.len; i += g.thickness * 2) {
        if (noise(i * 0.03, t) > 0.5) {
          rect(g.x + driftX, g.y + i, g.thickness, g.thickness * 1.1);
        }
      }
    } else {
      let driftY = map(cos(t * 0.55), -1, 1, -2.5, 2.5);
      for (let i = 0; i < g.len; i += g.thickness * 2) {
        if (noise(i * 0.03, t) > 0.5) {
          rect(g.x + i, g.y + driftY, g.thickness * 1.2, g.thickness);
        }
      }
    }
  }
}

function drawStripBands() {
  for (const b of stripBands) {
    let t = frameCount * 0.006 * MOTION + b.phase;
    let fragW = b.w / b.fragments;

    for (let i = 0; i < b.fragments; i++) {
      let fx = b.x + i * fragW;
      let wobble = map(noise(i * 0.4, t), 0, 1, -2.2, 2.2);
      let alpha = b.alpha * map(noise(i * 0.2, t + 50), 0, 1, 0.62, 1);

      fill(b.color[0], b.color[1], b.color[2], alpha);
      rect(fx, b.y + wobble, fragW * 0.92, b.h);

      fill(b.color[0], b.color[1], b.color[2], alpha * 0.12);
      rect(fx - 1, b.y + wobble - 1, fragW * 0.96, b.h + 2);
    }
  }
}

function drawAccentBlocks() {
  for (const a of accentBlocks) {
    let t = frameCount * 0.008 * MOTION + a.phase;
    let pulse = map(sin(t), -1, 1, 0.95, 1.05);
    let dx = map(noise(a.phase, t), 0, 1, -2.5, 2.5);
    let dy = map(noise(t, a.phase), 0, 1, -2, 2);

    fill(a.color[0], a.color[1], a.color[2], a.alpha);
    rect(a.x + dx, a.y + dy, a.w * pulse, a.h);

    fill(a.color[0], a.color[1], a.color[2], a.alpha * 0.16);
    rect(a.x + dx - 1.5, a.y + dy - 1, a.w * pulse + 3, a.h + 2);
  }
}

function drawClusterFields() {
  for (const cluster of activeClusters) {
    let t = frameCount * 0.006 * MOTION + cluster.phase;
    let cx = cluster.x + map(noise(cluster.phase, t), 0, 1, -16, 16);
    let cy = cluster.y + map(noise(t, cluster.phase), 0, 1, -16, 16);
    let rr = cluster.r * map(sin(t * 0.6), -1, 1, 0.92, 1.06);

    cluster.points = [];

    noFill();
    stroke(180, 190, 210, 10);
    strokeWeight(1);
    circle(cx, cy, rr * 1.5);
    noStroke();

    for (const c of cells) {
      let d = dist(c.x, c.y, cx, cy);
      if (d > rr) continue;

      let n = noise(c.gx * 0.22, c.gy * 0.22, t);
      if (n < 0.48) continue;

      let px = c.x + map(noise(c.gx, t), 0, 1, -1.4, 1.4);
      let py = c.y + map(noise(c.gy, t + 100), 0, 1, -1.4, 1.4);
      let size = map(n, 0.48, 1, 1.8, 5.8);

      let col = paperWhite;
      if (n > 0.82) col = sky;
      else if (n > 0.74) col = lilac;
      else if (n > 0.68) col = blue;

      fill(col[0], col[1], col[2], 78);
      rect(px - size / 2, py - size / 2, size, size);

      cluster.points.push({ x: px, y: py, d });
    }
  }
}

function drawLocalConnections() {
  for (const cluster of activeClusters) {
    if (!cluster.points || cluster.points.length < 2) continue;

    let pts = [...cluster.points].sort((a, b) => a.d - b.d);

    for (let i = 0; i < pts.length; i++) {
      let a = pts[i];
      let neighbors = 0;

      for (let j = i + 1; j < pts.length; j++) {
        let b = pts[j];
        let d = dist(a.x, a.y, b.x, b.y);

        if (d < 56 && neighbors < 1) {
          let alpha = map(d, 0, 56, 34, 8);

          if ((i + j) % 3 === 0) {
            drawDottedConnection(a.x, a.y, b.x, b.y, alpha);
          } else {
            stroke(180, 190, 210, alpha);
            strokeWeight(1);
            line(a.x, a.y, b.x, b.y);
          }

          neighbors++;
        }
      }
    }
  }

  noStroke();

  if (activeClusters.length > 1) {
    for (let i = 0; i < activeClusters.length - 1; i++) {
      let a = activeClusters[i];
      let b = activeClusters[i + 1];

      if (!a.points || !b.points || a.points.length === 0 || b.points.length === 0) continue;

      let pa = a.points[floor(a.points.length * 0.35)];
      let pb = b.points[floor(b.points.length * 0.35)];

      if (pa && pb) {
        drawDottedConnection(pa.x, pa.y, pb.x, pb.y, 9);
      }
    }
  }
}

function drawDottedConnection(x1, y1, x2, y2, alpha) {
  let steps = floor(dist(x1, y1, x2, y2) / 10);

  for (let i = 0; i <= steps; i++) {
    let t = i / max(steps, 1);
    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);
    fill(200, 210, 225, alpha * 0.78);
    rect(x - 0.85, y - 0.85, 1.7, 1.7);
  }
}

function drawSeams() {
  for (let gx = 6; gx < cols; gx += 11) {
    for (let gy = 0; gy < rows; gy++) {
      if ((gx + gy + floor(frameCount * 0.04 * MOTION)) % 3 !== 0) continue;
      let x = margin + gx * spacing;
      let y = margin + gy * spacing;
      fill(chalk[0], chalk[1], chalk[2], 14);
      rect(x - 1, y - 1, 2, 2);
    }
  }

  for (let gy = 5; gy < rows; gy += 8) {
    for (let gx = 0; gx < cols; gx++) {
      if ((gx + gy + floor(frameCount * 0.035 * MOTION)) % 4 !== 0) continue;
      let x = margin + gx * spacing;
      let y = margin + gy * spacing;
      fill(chalk[0], chalk[1], chalk[2], 12);
      rect(x - 1, y - 1, 2, 2);
    }
  }
}

function drawAnchors() {
  for (let i = 0; i < anchorPoints.length; i++) {
    const a = anchorPoints[i];
    let t = frameCount * 0.01 * MOTION + a.phase;

    let x = margin + a.gx * spacing + map(noise(a.phase, t), 0, 1, -1.5, 1.5);
    let y = margin + a.gy * spacing + map(noise(t, a.phase), 0, 1, -1.5, 1.5);
    let size = map(sin(t), -1, 1, 3.5, 5.5);

    fill(paperWhite[0], paperWhite[1], paperWhite[2], 70);
    rect(x - size / 2, y - size / 2, size, size);
  }
}

function drawDust() {
  for (let i = 0; i < 140; i++) {
    let x = noise(i * 10.1, frameCount * 0.006 * MOTION) * width;
    let y = noise(i * 15.4, 200 + frameCount * 0.005 * MOTION) * height;
    let a = noise(i * 4.3, 500 + frameCount * 0.005 * MOTION) * 14;

    fill(chalk[0], chalk[1], chalk[2], a);
    rect(x, y, 1, 1);
  }
}

// --------------------
// HELPERS
// --------------------

function insideRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function randomFromCell(gx, gy, seedOffset = 0) {
  let v = sin(gx * 12.9898 + gy * 78.233 + seedOffset * 0.001) * 43758.5453;
  return v - floor(v);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initSystem();
}
