import { HexagonCoord } from "./HexagonUtils";
import { ZombieGroup } from "../entities/ZombieGroup";
import { HexContentManager } from "./HexContentManager";

export class SpawnService {
  private hexContentManager: HexContentManager;
  private zombieGroup: ZombieGroup;
  private gameScene: Phaser.Scene;

  constructor(zombieGroup: ZombieGroup, gameScene: Phaser.Scene) {
    this.zombieGroup = zombieGroup;
    this.gameScene = gameScene;
    this.hexContentManager = new HexContentManager();
  }

  handleHexDiscovered(hex: HexagonCoord, spawnEmpty: boolean = false): void {
    // Register the hex with the content manager
    this.hexContentManager.registerHex(hex);

    if (spawnEmpty) return;

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

  onZombieKilled(zombie: any): void {
    // Find which hex this zombie belonged to
    const hex = this.hexContentManager.findHexForEntity(zombie);
    if (hex) {
      this.hexContentManager.onContentConsumed(hex);
    }
  }

  onItemPickedUp(item: any): void {
    // Find which hex this item belonged to
    const hex = this.hexContentManager.findHexForEntity(item);
    if (hex) {
      this.hexContentManager.onContentConsumed(hex);
    }
  }

  private getPlayerPosition(): { x: number; y: number } | null {
    // Get player position from the game scene
    const gameScene = this.gameScene as any;
    if (gameScene.character) {
      return {
        x: gameScene.character.x,
        y: gameScene.character.y,
      };
    }
    return null;
  }
}
