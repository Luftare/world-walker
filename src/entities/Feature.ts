import { gameConfig } from "../config/gameConfig";
import { HexagonCoord } from "../utils/HexagonUtils";

export class Feature {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private hexCoord: HexagonCoord;
  private collected: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    hexCoord: HexagonCoord
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.hexCoord = hexCoord;
    this.graphics = scene.add.graphics();
    this.render();
  }

  private render(): void {
    this.graphics.clear();

    if (this.collected) {
      // Don't render if collected
      return;
    }

    // Draw feature as green circle with border
    this.graphics.fillStyle(gameConfig.colors.feature);
    this.graphics.lineStyle(2, gameConfig.colors.featureBorder);
    this.graphics.fillCircle(0, 0, gameConfig.featureRadius * gameConfig.scale);
    this.graphics.strokeCircle(
      0,
      0,
      gameConfig.featureRadius * gameConfig.scale
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

  getHexCoord(): HexagonCoord {
    return this.hexCoord;
  }

  isCollected(): boolean {
    return this.collected;
  }

  collect(): void {
    if (!this.collected) {
      this.collected = true;
      this.render(); // Re-render to hide the feature
      // Could add collection animation or effects here
    }
  }

  // Check if a world position is close enough to collect this feature
  canCollect(worldX: number, worldY: number): boolean {
    if (this.collected) {
      return false;
    }

    const distance = Math.sqrt(
      Math.pow(worldX - this.x, 2) + Math.pow(worldY - this.y, 2)
    );

    const collectionRadius =
      (gameConfig.featureRadius + gameConfig.playerRadius) * gameConfig.scale;
    return distance <= collectionRadius;
  }

  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
