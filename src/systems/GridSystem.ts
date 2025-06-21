import { gameConfig } from "../config/gameConfig";
import { HexagonUtils, HexagonCoord } from "../utils/HexagonUtils";
import { Character } from "../entities/Character";

interface PopulatedHexagon {
  coord: HexagonCoord;
  hasFeature: boolean;
  featureEntity?: any; // Will be Feature entity when implemented
}

export class GridSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private populatedHexagons: Map<string, PopulatedHexagon> = new Map();
  private lastCharacterHex: HexagonCoord = { q: 0, r: 0 };
  private gridGraphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, character: Character) {
    this.scene = scene;
    this.character = character;
    this.initializeGrid();
  }

  private initializeGrid(): void {
    // Create graphics object for grid visualization (debug mode)
    if (gameConfig.devMode) {
      this.gridGraphics = this.scene.add.graphics();
    }

    // Populate initial hexagons around character's starting position
    const characterPos = this.character.getPosition();
    const characterHex = HexagonUtils.worldToHexagon(
      characterPos.x,
      characterPos.y
    );
    this.lastCharacterHex = characterHex;

    this.populateHexagonsAroundPosition(characterHex);
  }

  update(time: number, delta: number): void {
    // Check if character has moved to a different hexagon
    const characterPos = this.character.getPosition();
    const currentHex = HexagonUtils.worldToHexagon(
      characterPos.x,
      characterPos.y
    );

    if (
      currentHex.q !== this.lastCharacterHex.q ||
      currentHex.r !== this.lastCharacterHex.r
    ) {
      this.lastCharacterHex = currentHex;
      this.populateHexagonsAroundPosition(currentHex);
    }

    // Update grid visualization if in dev mode
    if (gameConfig.devMode && this.gridGraphics) {
      this.updateGridVisualization();
    }
  }

  private populateHexagonsAroundPosition(centerHex: HexagonCoord): void {
    const populateRange = Math.ceil(
      gameConfig.populateDistance /
        (gameConfig.hexagonRadius * gameConfig.scale)
    );
    const hexagonsToPopulate = HexagonUtils.getHexagonsInRange(
      centerHex,
      populateRange
    );

    hexagonsToPopulate.forEach((hex) => {
      const hexKey = this.getHexagonKey(hex);

      // Only populate if not already populated
      if (!this.populatedHexagons.has(hexKey)) {
        this.populateHexagon(hex);
      }
    });
  }

  private populateHexagon(hex: HexagonCoord): void {
    const hexKey = this.getHexagonKey(hex);

    // Determine if this hexagon should have a feature (simple random for now)
    const hasFeature = Math.random() < 0.3; // 30% chance

    const populatedHex: PopulatedHexagon = {
      coord: hex,
      hasFeature,
      featureEntity: undefined, // Will be created when Feature entity is implemented
    };

    this.populatedHexagons.set(hexKey, populatedHex);

    // TODO: Create Feature entity if hasFeature is true
    // This will be implemented in task 4.3
  }

  private updateGridVisualization(): void {
    if (!this.gridGraphics) return;

    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, gameConfig.colors.grid, 0.3);

    // Draw hexagons around character position
    const characterPos = this.character.getPosition();
    const characterHex = HexagonUtils.worldToHexagon(
      characterPos.x,
      characterPos.y
    );
    const visibleRange = 3; // Show 3 hexagon rings around character
    const visibleHexagons = HexagonUtils.getHexagonsInRange(
      characterHex,
      visibleRange
    );

    visibleHexagons.forEach((hex) => {
      this.drawHexagon(hex);
    });
  }

  private drawHexagon(hex: HexagonCoord): void {
    if (!this.gridGraphics) return;

    const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);
    const points = HexagonUtils.calculateHexagonPoints(worldPos.x, worldPos.y);

    // Draw hexagon outline
    this.gridGraphics.beginPath();
    this.gridGraphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.gridGraphics.lineTo(points[i].x, points[i].y);
    }

    this.gridGraphics.closePath();
    this.gridGraphics.strokePath();

    // Highlight populated hexagons
    const hexKey = this.getHexagonKey(hex);
    const populatedHex = this.populatedHexagons.get(hexKey);

    if (populatedHex) {
      if (populatedHex.hasFeature) {
        // Draw a small circle to indicate feature
        this.gridGraphics.fillStyle(gameConfig.colors.feature, 0.5);
        this.gridGraphics.fillCircle(worldPos.x, worldPos.y, 5);
      } else {
        // Draw a small dot to indicate populated but no feature
        this.gridGraphics.fillStyle(gameConfig.colors.grid, 0.3);
        this.gridGraphics.fillCircle(worldPos.x, worldPos.y, 2);
      }
    }
  }

  private getHexagonKey(hex: HexagonCoord): string {
    return `${hex.q},${hex.r}`;
  }

  // Public methods for other systems
  getPopulatedHexagons(): Map<string, PopulatedHexagon> {
    return this.populatedHexagons;
  }

  isHexagonPopulated(hex: HexagonCoord): boolean {
    return this.populatedHexagons.has(this.getHexagonKey(hex));
  }

  getHexagonAt(worldX: number, worldY: number): HexagonCoord {
    return HexagonUtils.worldToHexagon(worldX, worldY);
  }

  // Method to force populate hexagons (useful for testing)
  forcePopulateRange(centerHex: HexagonCoord, range: number): void {
    const hexagons = HexagonUtils.getHexagonsInRange(centerHex, range);
    hexagons.forEach((hex) => {
      const hexKey = this.getHexagonKey(hex);
      if (!this.populatedHexagons.has(hexKey)) {
        this.populateHexagon(hex);
      }
    });
  }
}
