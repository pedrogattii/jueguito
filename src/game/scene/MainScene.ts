import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private currentTool: string = 'inspect';
  private npcs!: Phaser.Physics.Arcade.Group;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private epsteinZones: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('MainScene');
  }

  preload() {
    // Load generated assets
    this.load.image('grass', '/assets/grass.jpg');
    this.load.image('water', '/assets/water.jpg');
  }

  create() {
    // 1. Generate premium terrain (cellular automata islands)
    this.generateTerrain();

    // 2. Setup NPCs group
    this.npcs = this.physics.add.group({
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1
    });

    // 3. Setup Input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.handlePointerDown(worldPoint.x, worldPoint.y);
    });
    
    // Pan camera with drag
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.currentTool !== 'inspect') return;
      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    // Zoom camera with wheel
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const newZoom = this.cameras.main.zoom - deltaY * 0.001;
      this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.5, 2));
    });
  }

  update() {
    // Update NPCs logic (e.g., Epstein island madness)
    this.npcs.children.iterate((npc: any) => {
      let inIsland = false;
      for (const zone of this.epsteinZones) {
        if (Phaser.Geom.Rectangle.Contains(zone.getBounds(), npc.x, npc.y)) {
          inIsland = true;
          break;
        }
      }
      
      if (inIsland) {
        npc.setVelocity(
          (Math.random() - 0.5) * 600,
          (Math.random() - 0.5) * 600
        );
        npc.setTint(0xff0000);
      } else {
        npc.clearTint();
        // random wandering
        if (Math.random() < 0.01) {
          npc.setVelocityX((Math.random() - 0.5) * 150);
          npc.setVelocityY((Math.random() - 0.5) * 150);
        }
      }
      return true;
    });
  }

  public setCurrentTool(tool: string) {
    this.currentTool = tool;
  }

  private generateTerrain() {
    const width = 100;
    const height = 100;
    const tileSize = 64; // since generated images are usually larger, we scale them or draw them 64x64

    // Very simple noise/island generation
    let mapData: number[][] = [];
    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        // Distance from center
        const dx = x - width / 2;
        const dy = y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Random noise + distance
        const val = Math.random() * 40 + dist;
        row.push(val < 50 ? 1 : 0); // 1 = grass, 0 = water
      }
      mapData.push(row);
    }

    // Smooth it (Cellular automata)
    for (let i = 0; i < 3; i++) {
      const newMap = JSON.parse(JSON.stringify(mapData));
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let neighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              neighbors += mapData[y + dy][x + dx];
            }
          }
          if (neighbors > 4) newMap[y][x] = 1;
          else if (neighbors < 4) newMap[y][x] = 0;
        }
      }
      mapData = newMap;
    }

    // Render it using sprites for now for simplicity and crispness
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const texture = mapData[y][x] === 1 ? 'grass' : 'water';
        const tile = this.add.image(x * tileSize, y * tileSize, texture);
        tile.setDisplaySize(tileSize, tileSize);
        tile.setOrigin(0, 0);
      }
    }

    this.physics.world.setBounds(0, 0, width * tileSize, height * tileSize);
    this.cameras.main.setBounds(0, 0, width * tileSize, height * tileSize);
    this.cameras.main.centerOn((width * tileSize) / 2, (height * tileSize) / 2);
  }

  private handlePointerDown(x: number, y: number) {
    if (this.currentTool === 'skibidi' || this.currentTool === 'chad') {
      this.spawnNPC(x, y, this.currentTool);
    } else if (this.currentTool === 'epstein') {
      this.createEpsteinIsland(x, y);
    } else if (this.currentTool === 'cancel') {
      this.cancelCulture(x, y);
    } else if (this.currentTool === 'nuke') {
      this.ratioNuke();
    }
  }

  private spawnNPC(x: number, y: number, type: string) {
    const size = type === 'chad' ? 40 : 32;
    const color = type === 'chad' ? 0x222222 : 0xeeeeee;
    
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(-size/2, -size/2, size, size);
    
    // Eyes for personality
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(-size/4, -size/4, size/5, size/5);
    graphics.fillRect(size/10, -size/4, size/5, size/5);
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-size/4 + 2, -size/4 + 2, size/10, size/10);
    graphics.fillRect(size/10 + 2, -size/4 + 2, size/10, size/10);
    
    graphics.generateTexture(type + 'Texture', size, size);
    graphics.destroy();

    const npc = this.npcs.create(x, y, type + 'Texture') as Phaser.Physics.Arcade.Sprite;
    npc.setVelocity((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
    npc.setCollideWorldBounds(true);
    npc.setBounce(1);
  }

  private createEpsteinIsland(x: number, y: number) {
    const size = 300;
    const zone = this.add.rectangle(x, y, size, size, 0x000000, 0.4);
    this.epsteinZones.push(zone);
    
    const text = this.add.text(x, y, 'Epstein Island\n(Danger)', { 
      color: '#ff0000', 
      align: 'center',
      fontSize: '24px',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  private cancelCulture(x: number, y: number) {
    const cancelRadius = 150;
    
    const circle = this.add.circle(x, y, cancelRadius, 0xff0000, 0.6);
    this.tweens.add({
      targets: circle,
      scale: 1.5,
      alpha: 0,
      duration: 600,
      onComplete: () => circle.destroy()
    });

    this.npcs.children.iterate((npc: any) => {
      if (Phaser.Math.Distance.Between(x, y, npc.x, npc.y) <= cancelRadius) {
        npc.destroy();
      }
      return true;
    });
  }

  private ratioNuke() {
    this.cameras.main.flash(800, 255, 255, 255);
    this.cameras.main.shake(1000, 0.05);
    this.npcs.clear(true, true);
    this.epsteinZones.forEach(z => z.destroy());
    this.epsteinZones = [];
    
    // Remove all text objects
    this.children.list
      .filter(child => child instanceof Phaser.GameObjects.Text)
      .forEach(text => text.destroy());
  }
}
