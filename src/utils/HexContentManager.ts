import { HexagonCoord, HexagonUtils } from "./HexagonUtils";
import { WalkingZombie } from "../entities/WalkingZombie";
import { PickableItem } from "../entities/PickableItem";
import { AmmoPack } from "../entities/AmmoPack";
import { HealthPack } from "../entities/HealthPack";
import { Coin } from "../entities/Coin";
import { gameConfig } from "../config/gameConfig";

export type HexContentType = "zombie" | "ammo" | "health" | "coin" | "empty";

interface HexContentState {
  type: HexContentType;
  entity?: WalkingZombie | PickableItem;
  respawnTime?: number;
  isActive: boolean;
}

export class HexContentManager {
  private hexStates: Map<string, HexContentState> = new Map();
  private readonly RESPAWN_DELAY = 10000; // 10 seconds
  private readonly ZOMBIE_CHANCE = 0.8; // 80% chance for zombie

  constructor() {
    // Initialize hex content manager
  }

  registerHex(hex: HexagonCoord): void {
    const hexKey = this.getHexKey(hex);
    if (!this.hexStates.has(hexKey)) {
      this.hexStates.set(hexKey, {
        type: "empty",
        isActive: false,
      });
    }
  }

  canSpawnInHex(hex: HexagonCoord, playerX: number, playerY: number): boolean {
    const hexKey = this.getHexKey(hex);
    const state = this.hexStates.get(hexKey);

    if (!state) return false;

    // Check if hex already has active content
    if (state.isActive && state.entity) return false;

    // Check if hex is within safe distance from player
    const hexWorldPos = this.getHexWorldPosition(hex);
    const distance = Math.sqrt(
      Math.pow(hexWorldPos.x - playerX, 2) +
        Math.pow(hexWorldPos.y - playerY, 2)
    );

    return distance >= gameConfig.spawnMinDistance;
  }

  spawnContentInHex(
    hex: HexagonCoord,
    gameScene: Phaser.Scene,
    zombieGroup: any
  ): WalkingZombie | PickableItem | null {
    const hexKey = this.getHexKey(hex);
    const state = this.hexStates.get(hexKey);

    if (!state || state.isActive) return null;

    const hexWorldPos = this.getHexWorldPosition(hex);
    const spawnPos = this.getRandomSpawnPosition(hexWorldPos);

    const roll = Math.random();
    let entity: WalkingZombie | PickableItem;
    let contentType: HexContentType;

    if (roll < this.ZOMBIE_CHANCE) {
      // Spawn zombie
      entity = zombieGroup.addZombie(spawnPos.x, spawnPos.y);
      contentType = "zombie";
    } else {
      // Spawn random pickable item
      const itemRoll = Math.random();
      if (itemRoll < 0.33) {
        entity = new AmmoPack(gameScene, spawnPos.x, spawnPos.y);
        contentType = "ammo";
        // Add to game scene's ammo packs array
        const gameSceneAny = gameScene as any;
        if (gameSceneAny.ammoPacks) {
          gameSceneAny.ammoPacks.push(entity);
        }
      } else if (itemRoll < 0.66) {
        entity = new HealthPack(gameScene, spawnPos.x, spawnPos.y);
        contentType = "health";
        // Add to game scene's health packs array
        const gameSceneAny = gameScene as any;
        if (gameSceneAny.healthPacks) {
          gameSceneAny.healthPacks.push(entity);
        }
      } else {
        entity = new Coin(gameScene, spawnPos.x, spawnPos.y);
        contentType = "coin";
        // Add to game scene's coins array
        const gameSceneAny = gameScene as any;
        if (gameSceneAny.coins) {
          gameSceneAny.coins.push(entity);
        }
      }
    }

    // Update hex state
    this.hexStates.set(hexKey, {
      type: contentType,
      entity,
      isActive: true,
    });

    return entity;
  }

  onContentConsumed(hex: HexagonCoord): void {
    const hexKey = this.getHexKey(hex);
    const state = this.hexStates.get(hexKey);

    if (!state) return;

    // Schedule respawn
    const respawnTime = Date.now() + this.RESPAWN_DELAY;

    this.hexStates.set(hexKey, {
      type: "empty",
      respawnTime,
      isActive: false,
    });
  }

  checkRespawns(
    gameScene: Phaser.Scene,
    zombieGroup: any,
    playerX: number,
    playerY: number
  ): void {
    const currentTime = Date.now();

    for (const [hexKey, state] of this.hexStates.entries()) {
      if (state.respawnTime && currentTime >= state.respawnTime) {
        const hex = this.parseHexKey(hexKey);

        if (this.canSpawnInHex(hex, playerX, playerY)) {
          this.spawnContentInHex(hex, gameScene, zombieGroup);
        } else {
          // If can't spawn now, keep the respawn time for next check
          // This will retry when player moves away
        }
      }
    }
  }

  getHexContent(hex: HexagonCoord): HexContentState | undefined {
    const hexKey = this.getHexKey(hex);
    return this.hexStates.get(hexKey);
  }

  findHexForEntity(entity: WalkingZombie | PickableItem): HexagonCoord | null {
    for (const [hexKey, state] of this.hexStates.entries()) {
      if (state.entity === entity) {
        return this.parseHexKey(hexKey);
      }
    }
    return null;
  }

  private getHexKey(hex: HexagonCoord): string {
    return `${hex.q},${hex.r}`;
  }

  private parseHexKey(hexKey: string): HexagonCoord {
    const parts = hexKey.split(",");
    if (parts.length !== 2) {
      throw new Error(`Invalid hex key format: ${hexKey}`);
    }
    const q = parseInt(parts[0]!, 10);
    const r = parseInt(parts[1]!, 10);
    return { q, r };
  }

  private getHexWorldPosition(hex: HexagonCoord): { x: number; y: number } {
    return HexagonUtils.hexagonToWorld(hex.q, hex.r);
  }

  private getRandomSpawnPosition(hexCenter: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    // Add some randomness within the hex
    const spawnRadius = gameConfig.hexagonRadius;
    const randomOffset = {
      x: (Math.random() - 0.5) * spawnRadius,
      y: (Math.random() - 0.5) * spawnRadius,
    };

    return {
      x: hexCenter.x + randomOffset.x,
      y: hexCenter.y + randomOffset.y,
    };
  }
}
