const canvas = document.getElementById('kerstCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

function showLetters(t) {
  ctx.save();
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  const text = 'het Mediacollege wenst u een prettige kerstvakantie';
  // Bereken startpositie zodat tekst gecentreerd blijft
  const metrics = ctx.measureText(text);
  const totalWidth = metrics.width;
  let x = W / 2 - totalWidth / 2;
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    const letterWidth = ctx.measureText(letter).width;
    // Regenboogkleur per letter
    const hue = ((t / 8) + i * 18) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.shadowColor = `hsl(${(hue + 60) % 360}, 100%, 80%)`;
    ctx.shadowBlur = 40 + 20 * Math.sin(t / 300 + i);
    ctx.fillText(letter, x + letterWidth / 2, 50);
    x += letterWidth;
  }
  ctx.restore();
}

// Kerstboom parameters
const tree = {
  x: W / 2,
  y: H - 100,
  width: 120,
  height: 300,
  layers: 5
};

// Lampjes
const lights = [];
const lightColors = ['#ff0', '#f00', '#0f0', '#0ff', '#f0f', '#fff'];
for (let l = 0; l < 40; l++) {
  const layer = Math.floor(l / 8);
  const angle = (l % 8) * (Math.PI * 2 / 8) + Math.random() * 0.2;
  const radius = 40 + layer * 30;
  lights.push({
    x: tree.x + Math.cos(angle) * radius,
    y: tree.y - tree.height + 60 + layer * 50 + Math.sin(angle) * 10,
    color: lightColors[l % lightColors.length],
    blink: Math.random() * 2 * Math.PI
  });
}

// Vuurwerk
const fireworks = [];
function spawnFirework() {
  const x = Math.random() * W;
  const y = Math.random() * H * 0.5;
  const color = lightColors[Math.floor(Math.random() * lightColors.length)];
  const particles = [];
  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30;
    const speed = 2 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color
    });
  }
  fireworks.push({particles});
}

function drawTree() {
  // Stam
  ctx.fillStyle = '#964B00';
  ctx.fillRect(tree.x - 15, tree.y - 20, 30, 40);
  // Boomlagen
  for (let i = 0; i < tree.layers; i++) {
    ctx.beginPath();
    ctx.moveTo(tree.x, tree.y - tree.height + i * (tree.height / tree.layers));
    ctx.lineTo(tree.x - tree.width / 2 + i * 10, tree.y - i * 50);
    ctx.lineTo(tree.x + tree.width / 2 - i * 10, tree.y - i * 50);
    ctx.closePath();
    ctx.fillStyle = '#0a3';
    ctx.fill();
    ctx.strokeStyle = '#070';
    ctx.stroke();
  }
  // Ster
  ctx.save();
  ctx.translate(tree.x, tree.y - tree.height - 10);
  ctx.rotate(Math.sin(Date.now() / 500) * 0.2);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 18, Math.sin((18 + i * 72) * Math.PI / 180) * 18);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 8, Math.sin((54 + i * 72) * Math.PI / 180) * 8);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function drawLights(t) {
  for (const light of lights) {
    const blink = 0.5 + 0.5 * Math.sin(t / 400 + light.blink);
    ctx.beginPath();
    ctx.arc(light.x, light.y, 7 * blink, 0, Math.PI * 2);
    ctx.fillStyle = light.color;
    ctx.globalAlpha = blink;
    ctx.shadowColor = light.color;
    ctx.shadowBlur = 15 * blink;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

function drawFireworks() {
  for (const fw of fireworks) {
    for (const p of fw.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }
}

function updateFireworks() {
  for (const fw of fireworks) {
    for (const p of fw.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= 0.012;
    }
  }
  // Verwijder oude vuurwerk
  for (let i = fireworks.length - 1; i >= 0; i--) {
    if (fireworks[i].particles.every(p => p.alpha <= 0)) {
      fireworks.splice(i, 1);
    }
  }
}

let lastFirework = 0;
function animate(t) {
  ctx.clearRect(0, 0, W, H);
  // Tekst bovenaan
  showLetters(t);
  // Vuurwerk
  drawFireworks();
  updateFireworks();
  if (t - lastFirework > 900) {
    spawnFirework();
    lastFirework = t;
  }
  // Kerstboom
  drawTree();
  // Lampjes
  drawLights(t);
  requestAnimationFrame(animate);
}

animate(0);
