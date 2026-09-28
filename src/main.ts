import './style.css';
import Phaser from 'phaser';

class BrainrotScene extends Phaser.Scene {
  private currentTool: string = 'skibidi';
  private npcs: Phaser.Physics.Arcade.Group;
  private epsteinZones: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('BrainrotScene');
  }

  preload() {
    // Aquí cargaremos los assets reales más adelante.
    // Por ahora generaremos gráficos dinámicos básicos.
  }

  create() {
    this.cameras.main.setBackgroundColor('#2c5e1e');
    this.npcs = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // Configurar interacciones de ratón
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer.x, pointer.y);
    });

    this.setupUI();
  }

  update() {
    // Lógica especial si los NPCs están en Epstein Island
    this.npcs.children.iterate((npc: any) => {
      let inIsland = false;
      for (const zone of this.epsteinZones) {
        if (Phaser.Geom.Rectangle.Contains(zone.getBounds(), npc.x, npc.y)) {
          inIsland = true;
          break;
        }
      }
      
      if (inIsland) {
        // En Epstein Island se vuelven loquitos (velocidad errática)
        npc.setVelocity(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400
        );
        npc.setTint(0xff0000);
      } else {
        npc.clearTint();
        // Restaurar velocidad si se frena mucho
        if (Math.abs(npc.body.velocity.x) < 50) npc.setVelocityX((Math.random() - 0.5) * 100);
        if (Math.abs(npc.body.velocity.y) < 50) npc.setVelocityY((Math.random() - 0.5) * 100);
      }
      return true;
    });
  }

  private handlePointerDown(x: number, y: number) {
    switch (this.currentTool) {
      case 'skibidi':
      case 'chad':
        this.spawnNPC(x, y, this.currentTool);
        break;
      case 'epstein':
        this.createEpsteinIsland(x, y);
        break;
      case 'cancel':
        this.cancelCulture(x, y);
        break;
      case 'nuke':
        this.ratioNuke();
        break;
    }
  }

  private spawnNPC(x: number, y: number, type: string) {
    const size = type === 'chad' ? 30 : 20;
    const color = type === 'chad' ? 0x333333 : 0xcccccc;
    
    // Crear un gráfico temporal
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(-size/2, -size/2, size, size);
    graphics.generateTexture(type + 'Texture', size, size);
    graphics.destroy();

    const npc = this.npcs.create(x, y, type + 'Texture') as Phaser.Physics.Arcade.Sprite;
    npc.setVelocity((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    npc.setData('type', type);
  }

  private createEpsteinIsland(x: number, y: number) {
    const size = 150;
    const zone = this.add.rectangle(x, y, size, size, 0x000000, 0.3);
    this.epsteinZones.push(zone);
    
    // Texto indicativo
    this.add.text(x - 40, y - 10, 'Epstein\nIsland', { color: '#ffffff', align: 'center' });
  }

  private cancelCulture(x: number, y: number) {
    const cancelRadius = 80;
    
    // Efecto visual
    const circle = this.add.circle(x, y, cancelRadius, 0xff0000, 0.5);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy()
    });

    // Eliminar NPCs
    this.npcs.children.iterate((npc: any) => {
      if (Phaser.Math.Distance.Between(x, y, npc.x, npc.y) <= cancelRadius) {
        npc.destroy();
      }
      return true; // Necesario para que no falle el iterador tras destroy
    });
  }

  private ratioNuke() {
    this.cameras.main.flash(500, 255, 255, 255);
    this.npcs.clear(true, true);
    this.epsteinZones.forEach(z => z.destroy());
    this.epsteinZones = [];
    // Destruir todos los textos
    this.children.list
      .filter(child => child instanceof Phaser.GameObjects.Text)
      .forEach(text => text.destroy());
  }

  private setupUI() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        this.currentTool = target.dataset.tool!;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
      });
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: BrainrotScene
};

new Phaser.Game(config);
