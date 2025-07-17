import { HexagonCoord } from "./HexagonUtils";
import { WalkingEnemiesGroup } from "../entities/WalkingEnemiesGroup";
import { HexContentManager } from "./HexContentManager";
import type { GameScene } from "../scenes/GameScene";
import { BaseEnemy } from "../entities/BaseEnemy";
import { PickableItem } from "../entities/PickableItem";

export class SpawnService {
  private hexContentManager: HexContentManager;
  private zombieGroup: WalkingEnemiesGroup;
  private gameScene: GameScene;

  constructor(zombieGroup: WalkingEnemiesGroup, gameScene: GameScene) {
    this.zombieGroup = zombieGroup;
    this.gameScene = gameScene;
    this.hexContentManager = new HexContentManager();
  }

  handleHexDiscovered(hex: HexagonCoord): void {
    // Register the hex with the content manager
    this.hexContentManager.registerHex(hex);

    // Get player position for distance checking
    const playerPos = this.getPlayerPosition();
    if (!playerPos) return;

    // Check if we can spawn in this hex
    if (this.hexContentManager.canSpawnInHex(hex, playerPos.x, playerPos.y)) {
      this.hexContentManager.spawnContentInHex(
        hex,
        this.gameScene,
        this.zombieGroup
      );
    }
  }

  update(playerX: number, playerY: number): void {
    // Check for respawns
    this.hexContentManager.checkRespawns(
      this.gameScene,
      this.zombieGroup,
      playerX,
      playerY
    );
  }

  onZombieKilled(zombie: BaseEnemy): void {
    // Find which hex this zombie belonged to
    const hex = this.hexContentManager.findHexForEntity(zombie);
    if (hex) {
      this.hexContentManager.onContentConsumed(hex);
    }
  }

  onItemPickedUp(item: PickableItem): void {
    // Find which hex this item belonged to
    const hex = this.hexContentManager.findHexForEntity(item);
    if (hex) {
      this.hexContentManager.onContentConsumed(hex);
    }
  }

  private getPlayerPosition(): { x: number; y: number } | null {
    // Get player position from the game scene
    if (this.gameScene.character) {
      return {
        x: this.gameScene.character.x,
        y: this.gameScene.character.y,
      };
    }
    return null;
  }
}
