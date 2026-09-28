import Phaser from 'phaser';

const TILE_SIZE = 64;

export class MainScene extends Phaser.Scene {
  private currentTool: string = 'inspect';
  private npcs!: Phaser.Physics.Arcade.Group;
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private epsteinZones: Phaser.GameObjects.Rectangle[] = [];
  
  // 0: Water, 1: Sand, 2: Grass, 3: Mountain, 4: Snow
  private mapData: number[][] = []; 
  private widthTiles = 60;
  private heightTiles = 60;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('grass', '/assets/grass.jpg');
    this.load.image('water', '/assets/water.jpg');
    this.load.image('sand', '/assets/sand.jpg');
    this.load.image('mountain', '/assets/mountain.jpg');
    this.load.image('snow', '/assets/snow.jpg');
  }

  create() {
    this.generateTerrain();

    this.buildings = this.physics.add.staticGroup();
    this.npcs = this.physics.add.group({
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1
    });

    this.physics.add.collider(this.npcs, this.buildings);

    // Setup Input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.handlePointerDown(worldPoint.x, worldPoint.y);
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.currentTool !== 'inspect') return;
      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const newZoom = this.cameras.main.zoom - deltaY * 0.001;
      this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.2, 2));
    });
  }

  update() {
    this.npcs.children.iterate((npc: any) => {
      const tx = Math.floor(npc.x / TILE_SIZE);
      const ty = Math.floor(npc.y / TILE_SIZE);
      
      let inIsland = false;
      for (const zone of this.epsteinZones) {
        if (Phaser.Geom.Rectangle.Contains(zone.getBounds(), npc.x, npc.y)) {
          inIsland = true; break;
        }
      }
      
      if (inIsland) {
        npc.setVelocity((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
        npc.setTint(0xff0000);
      } else {
        npc.clearTint();
        // Custom AI Logic
        npc.timeAlive = (npc.timeAlive || 0) + 1;
        
        // Random wandering
        if (Math.random() < 0.02) {
          npc.setVelocityX((Math.random() - 0.5) * 150);
          npc.setVelocityY((Math.random() - 0.5) * 150);
        }

        // Build a brainrot settlement if they are on grass/sand and lived long enough
        if (npc.timeAlive > 300 && Math.random() < 0.005) {
          if (tx >= 0 && tx < this.widthTiles && ty >= 0 && ty < this.heightTiles) {
            const tileType = this.mapData[ty][tx];
            if (tileType === 2 || tileType === 1) { // Grass or sand
              this.buildSettlement(npc.x, npc.y, npc.getData('type'));
              npc.timeAlive = 0; // reset
            }
          }
        }
      }
      return true;
    });
  }

  public setCurrentTool(tool: string) {
    this.currentTool = tool;
  }

  private generateTerrain() {
    // Generate height map
    let heightMap: number[][] = [];
    for (let y = 0; y < this.heightTiles; y++) {
      let row = [];
      for (let x = 0; x < this.widthTiles; x++) {
        const dx = x - this.widthTiles / 2;
        const dy = y - this.heightTiles / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let val = Math.random() * 50 + dist;
        row.push(val); 
      }
      heightMap.push(row);
    }

    // Smooth (Cellular Automata) multiple passes
    for (let i = 0; i < 4; i++) {
      const newMap = JSON.parse(JSON.stringify(heightMap));
      for (let y = 1; y < this.heightTiles - 1; y++) {
        for (let x = 1; x < this.widthTiles - 1; x++) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              sum += heightMap[y + dy][x + dx];
            }
          }
          newMap[y][x] = sum / 9;
        }
      }
      heightMap = newMap;
    }

    // Convert height to Biomes
    for (let y = 0; y < this.heightTiles; y++) {
      let row = [];
      for (let x = 0; x < this.widthTiles; x++) {
        const h = heightMap[y][x];
        if (h > 65) row.push(0); // Deep Water
        else if (h > 58) row.push(1); // Sand
        else if (h > 40) row.push(2); // Grass
        else if (h > 25) row.push(3); // Mountain
        else row.push(4); // Snow
      }
      this.mapData.push(row);
    }

    // Render Tiles
    for (let y = 0; y < this.heightTiles; y++) {
      for (let x = 0; x < this.widthTiles; x++) {
        const type = this.mapData[y][x];
        let texture = 'water';
        if (type === 1) texture = 'sand';
        if (type === 2) texture = 'grass';
        if (type === 3) texture = 'mountain';
        if (type === 4) texture = 'snow';

        const tile = this.add.image(x * TILE_SIZE, y * TILE_SIZE, texture);
        tile.setDisplaySize(TILE_SIZE, TILE_SIZE);
        tile.setOrigin(0, 0);
      }
    }

    this.physics.world.setBounds(0, 0, this.widthTiles * TILE_SIZE, this.heightTiles * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, this.widthTiles * TILE_SIZE, this.heightTiles * TILE_SIZE);
    this.cameras.main.centerOn((this.widthTiles * TILE_SIZE) / 2, (this.heightTiles * TILE_SIZE) / 2);
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
    } else if (this.currentTool === 'tornado') {
      this.spawnTornado(x, y);
    } else if (this.currentTool === 'meteor') {
      this.spawnMeteor(x, y);
    }
  }

  private spawnNPC(x: number, y: number, type: string) {
    const size = type === 'chad' ? 40 : 32;
    const color = type === 'chad' ? 0x222222 : 0xeeeeee;
    
    if (!this.textures.exists(type + 'Texture')) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(-size/2, -size/2, size, size);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(-size/4, -size/4, size/5, size/5);
        graphics.fillRect(size/10, -size/4, size/5, size/5);
        graphics.generateTexture(type + 'Texture', size, size);
        graphics.destroy();
    }

    const npc = this.npcs.create(x, y, type + 'Texture') as Phaser.Physics.Arcade.Sprite;
    npc.setVelocity((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
    npc.setCollideWorldBounds(true);
    npc.setBounce(1);
    npc.setData('type', type);
  }

  private buildSettlement(x: number, y: number, type: string) {
    // Basic 5G tower or Gym for Chad
    const size = 50;
    const color = type === 'chad' ? 0x4444aa : 0xaaaa44; // blue for gym, yellow for 5G
    
    if (!this.textures.exists('building' + type)) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(-size/2, -size/2, size, size);
        graphics.fillStyle(0x000000, 1);
        graphics.strokeRect(-size/2, -size/2, size, size);
        graphics.generateTexture('building' + type, size, size);
        graphics.destroy();
    }

    const b = this.buildings.create(x, y, 'building' + type) as Phaser.Physics.Arcade.Sprite;
    this.add.text(x, y - 40, type === 'chad' ? 'Chad Gym' : '5G Tower', { 
      fontSize: '14px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 
    }).setOrigin(0.5);
  }

  private spawnTornado(x: number, y: number) {
    const tornado = this.add.circle(x, y, 60, 0xaaaaaa, 0.7);
    
    this.tweens.add({
      targets: tornado,
      x: x + (Math.random() - 0.5) * 500,
      y: y + (Math.random() - 0.5) * 500,
      duration: 3000,
      onUpdate: () => {
        this.npcs.children.iterate((npc: any) => {
          if (Phaser.Math.Distance.Between(tornado.x, tornado.y, npc.x, npc.y) <= 100) {
            npc.setVelocity(
              (tornado.x - npc.x) * 5 + (Math.random() - 0.5) * 500,
              (tornado.y - npc.y) * 5 + (Math.random() - 0.5) * 500
            );
            npc.setTint(0xaaaaaa);
          }
          return true;
        });
      },
      onComplete: () => tornado.destroy()
    });
  }

  private spawnMeteor(x: number, y: number) {
    const meteor = this.add.circle(x, y - 800, 40, 0xff5500, 1);
    
    this.tweens.add({
      targets: meteor,
      y: y,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        meteor.destroy();
        this.cameras.main.shake(500, 0.05);
        
        // Crater effect
        const crater = this.add.circle(x, y, 120, 0x000000, 0.8);
        this.tweens.add({ targets: crater, alpha: 0.3, duration: 2000 });

        // Kill everything in radius
        this.npcs.children.iterate((npc: any) => {
          if (Phaser.Math.Distance.Between(x, y, npc.x, npc.y) <= 150) {
            npc.destroy();
          }
          return true;
        });
        
        this.buildings.children.iterate((b: any) => {
          if (Phaser.Math.Distance.Between(x, y, b.x, b.y) <= 150) {
            b.destroy();
          }
          return true;
        });
      }
    });
  }

  private createEpsteinIsland(x: number, y: number) {
    const size = 300;
    const zone = this.add.rectangle(x, y, size, size, 0x000000, 0.4);
    this.epsteinZones.push(zone);
    
    this.add.text(x, y, 'Epstein Island\n(Danger)', { 
      color: '#ff0000', align: 'center', fontSize: '24px', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
  }

  private cancelCulture(x: number, y: number) {
    const cancelRadius = 150;
    const circle = this.add.circle(x, y, cancelRadius, 0xff0000, 0.6);
    this.tweens.add({ targets: circle, scale: 1.5, alpha: 0, duration: 600, onComplete: () => circle.destroy() });

    this.npcs.children.iterate((npc: any) => {
      if (Phaser.Math.Distance.Between(x, y, npc.x, npc.y) <= cancelRadius) npc.destroy();
      return true;
    });
  }

  private ratioNuke() {
    this.cameras.main.flash(800, 255, 255, 255);
    this.cameras.main.shake(1000, 0.05);
    this.npcs.clear(true, true);
    this.buildings.clear(true, true);
    this.epsteinZones.forEach(z => z.destroy());
    this.epsteinZones = [];
    
    this.children.list
      .filter(child => child instanceof Phaser.GameObjects.Text)
      .forEach(text => text.destroy());
  }
}
