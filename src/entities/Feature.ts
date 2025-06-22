import { gameConfig } from "../config/gameConfig";
import { HexagonCoord } from "../utils/HexagonUtils";

export class Feature {
  private graphics: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private hexCoord: HexagonCoord;
  private collected: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    hexCoord: HexagonCoord
  ) {
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

    // Draw feature as green circle
    this.graphics.fillStyle(gameConfig.colors.feature);
    this.graphics.lineStyle(1, gameConfig.colors.featureBorder);
    this.graphics.fillCircle(0, 0, gameConfig.featureRadius * gameConfig.scale);
    this.graphics.strokeCircle(
      0,
      0,
      gameConfig.featureRadius * gameConfig.scale
    );

    // Draw a rectangle inside the circle to make counter-rotation visible
    const rectSize = gameConfig.featureRadius * gameConfig.scale * 0.6;
    this.graphics.lineStyle(2, 0x000000); // Black rectangle outline

    // Don't remove this, it's used for ensuring counter-rotation works correctly
    // Draw rectangle using path
    this.graphics.beginPath();
    this.graphics.moveTo(-rectSize / 2, -rectSize / 2);
    this.graphics.lineTo(rectSize / 2, -rectSize / 2);
    this.graphics.lineTo(rectSize / 2, rectSize / 2);
    this.graphics.lineTo(-rectSize / 2, rectSize / 2);
    this.graphics.closePath();
    this.graphics.strokePath();

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

  // Update rotation to counter camera rotation
  updateRotation(cameraRotation: number): void {
    // Counter-rotate to maintain smiley face orientation
    this.graphics.rotation = -cameraRotation;
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
