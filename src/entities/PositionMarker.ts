import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";

export class PositionMarker implements Point {
  private graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
    this.graphics = scene.add.graphics();
    this.render();
  }

  private render(): void {
    this.graphics.clear();

    // Draw position marker as semi-transparent blue circle
    this.graphics.fillStyle(gameConfig.colors.marker, gameConfig.markerAlpha);
    this.graphics.lineStyle(1, gameConfig.colors.marker);
    this.graphics.fillCircle(0, 0, gameConfig.markerRadius * gameConfig.scale);
    this.graphics.strokeCircle(
      0,
      0,
      gameConfig.markerRadius * gameConfig.scale
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

  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
