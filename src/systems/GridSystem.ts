import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { HexagonUtils, HexagonCoord } from "../utils/HexagonUtils";
import { Character } from "../entities/Character";
import { BaseSystem } from "./BaseSystem";

export class GridSystem implements BaseSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private populatedHexagons: Map<string, HexagonCoord> = new Map();
  private lastCharacterHex: HexagonCoord = { q: 0, r: 0 };
  private gridGraphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, character: Character) {
    this.scene = scene;
    this.character = character;
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.gridGraphics = this.scene.add.graphics();

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

    if (this.gridGraphics) {
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
    const isRediscovery = this.populatedHexagons.has(hexKey);
    this.populatedHexagons.set(hexKey, hex);

    // Emit event for hex discovery/rediscovery
    this.scene.events.emit("hexDiscovered", hex, isRediscovery);
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

    if (populatedHex) {
      graphics.fillStyle(gameConfig.colors.grid, 0.3);
      graphics.fillCircle(worldPos.x, worldPos.y, 2);
    }
  }

  private getHexagonKey(hex: HexagonCoord): string {
    return `${hex.q},${hex.r}`;
  }
}
