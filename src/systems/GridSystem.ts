import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { HexagonUtils, HexagonCoord } from "../utils/HexagonUtils";
import { Character } from "../entities/Character";
import { Feature } from "../entities/Feature";

interface PopulatedHexagon {
  coord: HexagonCoord;
  hasFeature: boolean;
  featureEntity?: Feature | undefined;
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

  update(): void {
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

    // Check for feature collection
    this.checkFeatureCollection();
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
    const hasFeature = Math.random() < 0.5;

    let featureEntity: Feature | undefined;
    if (hasFeature) {
      const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);
      featureEntity = new Feature(this.scene, worldPos.x, worldPos.y, hex);
    }

    const populatedHex: PopulatedHexagon = {
      coord: hex,
      hasFeature,
      featureEntity,
    };

    this.populatedHexagons.set(hexKey, populatedHex);
  }

  private checkFeatureCollection(): void {
    const characterPos = this.character.getPosition();

    this.populatedHexagons.forEach((populatedHex) => {
      const feature = populatedHex.featureEntity;
      if (populatedHex.hasFeature && feature && !feature.isCollected()) {
        if (feature.canCollect(characterPos.x, characterPos.y)) {
          feature.collect();
          // Could add score, sound effects, etc. here
        }
      }
    });
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
    const graphics = this.gridGraphics;
    if (!graphics) return;

    const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);
    const points = HexagonUtils.calculateHexagonPoints(worldPos.x, worldPos.y);

    // Draw hexagon outline
    graphics.beginPath();
    graphics.moveTo(points[0]!.x, points[0]!.y);

    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i]!.x, points[i]!.y);
    }

    graphics.closePath();
    graphics.strokePath();

    // Draw small dot for populated hexagons (but not features, since they're now real entities)
    const hexKey = this.getHexagonKey(hex);
    const populatedHex = this.populatedHexagons.get(hexKey);

    if (populatedHex && !populatedHex.hasFeature) {
      // Only draw dot for populated hexagons without features
      graphics.fillStyle(gameConfig.colors.grid, 0.3);
      graphics.fillCircle(worldPos.x, worldPos.y, 2);
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

  // Get all features (useful for other systems)
  getFeatures(): Feature[] {
    const features: Feature[] = [];
    this.populatedHexagons.forEach((populatedHex) => {
      if (populatedHex.featureEntity) {
        features.push(populatedHex.featureEntity);
      }
    });
    return features;
  }

  // Update feature rotations to counter camera rotation
  updateFeatureRotations(cameraRotation: number): void {
    this.populatedHexagons.forEach((populatedHex) => {
      if (
        populatedHex.featureEntity &&
        !populatedHex.featureEntity.isCollected()
      ) {
        populatedHex.featureEntity.updateRotation(cameraRotation);
      }
    });
  }
}
