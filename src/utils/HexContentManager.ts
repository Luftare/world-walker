import { HexagonCoord, HexagonUtils } from "./HexagonUtils";
import { PickableItem } from "../entities/PickableItem";
import { AmmoPack } from "../entities/AmmoPack";
import { HealthPack } from "../entities/HealthPack";
import { gameConfig } from "../config/gameConfig";
import type { GameScene } from "../scenes/GameScene";
import { BaseEnemy } from "../entities/BaseEnemy";
import { WalkingEnemiesGroup } from "../entities/WalkingEnemiesGroup";
import { Point } from "../types/types";

export type HexContentType =
  | "zombie"
  | "ammo"
  | "health"
  | "cogwheel"
  | "empty";

interface HexContentState {
  type: HexContentType;
  entity?: BaseEnemy | PickableItem;
  respawnTime?: number;
  isActive: boolean;
}

export class HexContentManager {
  private hexStates: Map<string, HexContentState> = new Map();
  private readonly RESPAWN_DELAY = 30000;
  private readonly ZOMBIE_CHANCE = 0.05;
  private readonly HEALTHPACK_CHANCE = 0.05;

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

  spawnHexInitContent(hex: HexagonCoord, gameScene: GameScene): void {
    const potatoPosition = this.calculateRandomHexPosition(hex);
    const potato = new AmmoPack(gameScene, potatoPosition.x, potatoPosition.y);
    gameScene.pickableItems.push(potato);
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
    gameScene: GameScene,
    zombieGroup: WalkingEnemiesGroup
  ): BaseEnemy | PickableItem | null {
    const hexKey = this.getHexKey(hex);
    const state = this.hexStates.get(hexKey);

    if (!state || state.isActive) return null;

    const spawnPos = this.calculateRandomHexPosition(hex);

    const roll = Math.random();
    let entity: BaseEnemy | PickableItem | undefined;
    let contentType: HexContentType | undefined;

    if (roll < this.ZOMBIE_CHANCE) {
      // Spawn zombie
      entity = zombieGroup.addZombie(spawnPos.x, spawnPos.y);
      contentType = "zombie";
    } else if (roll < this.ZOMBIE_CHANCE + this.HEALTHPACK_CHANCE) {
      // Spawn health pack
      entity = new HealthPack(gameScene, spawnPos.x, spawnPos.y);
      contentType = "health";
      gameScene.pickableItems.push(entity);
    }

    if (!entity || !contentType) return null;

    // Update hex state
    this.hexStates.set(hexKey, {
      type: contentType,
      entity,
      isActive: true,
    });

    return entity;
  }

  calculateRandomHexPosition(hex: HexagonCoord): Point {
    const hexWorldPos = this.getHexWorldPosition(hex);
    return this.getRandomSpawnPosition(hexWorldPos);
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
    gameScene: GameScene,
    zombieGroup: WalkingEnemiesGroup,
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

  findHexForEntity(entity: BaseEnemy | PickableItem): HexagonCoord | null {
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
