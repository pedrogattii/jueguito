import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Brainrot WorldBox</h1>
  <div class="controls">
    <button id="spawn-skibidi" class="tool-btn" data-tool="skibidi">Spawn Skibidi Toilet</button>
    <button id="spawn-chad" class="tool-btn" data-tool="chad">Spawn GigaChad</button>
    <button id="power-cancel" class="tool-btn" data-tool="cancel">Power: Cancel Culture (Erase)</button>
    <button id="power-nuke" class="tool-btn" data-tool="nuke">Power: Ratio Nuke</button>
  </div>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
`

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let currentTool = 'skibidi';

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    currentTool = target.dataset.tool!;
    
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
  });
});

interface Entity {
  x: number;
  y: number;
  type: string;
  vx: number;
  vy: number;
  size: number;
  life: number;
}

let entities: Entity[] = [];

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentTool === 'skibidi' || currentTool === 'chad') {
    entities.push({
      x, y,
      type: currentTool,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: currentTool === 'chad' ? 20 : 15,
      life: 100
    });
  } else if (currentTool === 'cancel') {
    // Erase entities in a radius
    entities = entities.filter(ent => Math.hypot(ent.x - x, ent.y - y) > 50);
  } else if (currentTool === 'nuke') {
    // Kill almost everything
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    entities = [];
  }
});

function drawEntity(entity: Entity) {
  ctx.save();
  ctx.translate(entity.x, entity.y);
  
  if (entity.type === 'skibidi') {
    ctx.fillStyle = '#cccccc'; // Toilet base
    ctx.fillRect(-10, -5, 20, 15);
    ctx.fillStyle = '#ffcc99'; // Head
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (entity.type === 'chad') {
    ctx.fillStyle = '#333333';
    ctx.fillRect(-10, -20, 20, 40); // Body
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(-8, -25, 16, 10); // Face
  }

  ctx.restore();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const entity of entities) {
    entity.x += entity.vx;
    entity.y += entity.vy;

    // Bounce off walls
    if (entity.x < 0 || entity.x > canvas.width) entity.vx *= -1;
    if (entity.y < 0 || entity.y > canvas.height) entity.vy *= -1;

    drawEntity(entity);
  }

  requestAnimationFrame(update);
}

// Start loop
update();
