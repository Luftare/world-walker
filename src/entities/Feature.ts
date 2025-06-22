import { gameConfig } from "../config/gameConfig";
import { HexagonCoord } from "../utils/HexagonUtils";

export class Feature {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private hexCoord: HexagonCoord;
  private collected: boolean = false;
  private baseRotation: number = 0; // Track base rotation for counter-rotation

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    hexCoord: HexagonCoord,
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

    const scale = gameConfig.scale;
    const radius = gameConfig.featureRadius * scale;

    // Draw smiley face
    // Face (yellow circle)
    this.graphics.fillStyle(0xffff00);
    this.graphics.lineStyle(2, 0xcc9900);
    this.graphics.fillCircle(0, 0, radius);
    this.graphics.strokeCircle(0, 0, radius);

    // Eyes (black circles)
    const eyeOffset = radius * 0.35;
    const eyeRadius = radius * 0.15;
    this.graphics.fillStyle(0x000000);
    this.graphics.fillCircle(-eyeOffset, -eyeOffset * 0.5, eyeRadius);
    this.graphics.fillCircle(eyeOffset, -eyeOffset * 0.5, eyeRadius);

    // Mouth (simple curved line using connected line segments)
    this.graphics.lineStyle(3, 0x000000);
    this.graphics.beginPath();
    const mouthRadius = radius * 0.4;
    const mouthCenterY = eyeOffset * 0.2;
    const segments = 8;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI;
      const x = -mouthRadius + (2 * mouthRadius * i) / segments;
      const y = mouthCenterY + Math.sin(angle) * mouthRadius * 0.5;

      if (i === 0) {
        this.graphics.moveTo(x, y);
      } else {
        this.graphics.lineTo(x, y);
      }
    }
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
      Math.pow(worldX - this.x, 2) + Math.pow(worldY - this.y, 2),
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
