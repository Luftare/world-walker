import { gameConfig } from "../config/gameConfig";

export class Character {
  private graphics: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
    this.graphics = scene.add.graphics();
    this.render();
  }

  private render(): void {
    this.graphics.clear();

    // Draw character as gray circle
    this.graphics.fillStyle(gameConfig.colors.player);
    this.graphics.lineStyle(2, gameConfig.colors.playerBorder);
    this.graphics.fillCircle(0, 0, gameConfig.playerRadius * gameConfig.scale);
    this.graphics.strokeCircle(
      0,
      0,
      gameConfig.playerRadius * gameConfig.scale
    );

    // Set position
    this.graphics.setPosition(this.x, this.y);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.graphics.setPosition(x, y);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  destroy(): void {
    this.graphics.destroy();
  }

  update(): void {
    // Update character logic
  }
}
