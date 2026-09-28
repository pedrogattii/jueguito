import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scene/MainScene';

interface PhaserGameProps {
  currentTool: string;
}

export const PhaserGame = ({ currentTool }: PhaserGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: containerRef.current,
        backgroundColor: '#000000',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scene: [MainScene]
      };

      gameRef.current = new Phaser.Game(config);
    }

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Sync React state to Phaser Scene
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as MainScene | undefined;
      if (scene) {
        scene.setCurrentTool(currentTool);
      }
    }
  }, [currentTool]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};
