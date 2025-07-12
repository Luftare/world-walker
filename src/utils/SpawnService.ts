import { HexagonCoord, HexagonUtils } from "./HexagonUtils";
import { ZombieGroup } from "../entities/ZombieGroup";
import { AmmoPack } from "../entities/AmmoPack";
import { HealthPack } from "../entities/HealthPack";
import { gameConfig } from "../config/gameConfig";

export class SpawnService {
  private spawnState: Map<string, { timestamp: number; hasSpawned: boolean }> =
    new Map();
  private zombieGroup: ZombieGroup;
  private gameScene: Phaser.Scene;
  private readonly RESPAWN_DELAY = 20000; // 20 seconds
  private readonly AMMO_PACK_CHANCE = 0.25; // 25% chance for ammo pack
  private readonly HEALTH_PACK_CHANCE = 0.25; // 25% chance for health pack
  private initialHexesDiscovered = 0;

  constructor(zombieGroup: ZombieGroup, gameScene: Phaser.Scene) {
    this.zombieGroup = zombieGroup;
    this.gameScene = gameScene;
  }

  handleHexDiscovered(hex: HexagonCoord, spawnEmpty: boolean = false): void {
    const hexKey = this.getHexagonKey(hex);
    const currentTime = Date.now();
    // Check if this is a rediscovery
    const existingState = this.spawnState.get(hexKey);

    if (existingState) {
      // Rediscovery - check if enough time has passed
      const timeSinceLastSpawn = currentTime - existingState.timestamp;
      if (timeSinceLastSpawn >= this.RESPAWN_DELAY && !spawnEmpty) {
        this.spawnInHex(hex);
        this.spawnState.set(hexKey, {
          timestamp: currentTime,
          hasSpawned: true,
        });
      }
    } else {
      // First discovery
      this.initialHexesDiscovered++;
      if (!spawnEmpty) {
        this.spawnInHex(hex);
        this.spawnState.set(hexKey, {
          timestamp: currentTime,
          hasSpawned: true,
        });
      }
    }
  }

  private spawnInHex(hex: HexagonCoord): void {
    // Convert hex coordinates to world coordinates for rendering
    const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);

    // Add some randomness to the spawn position within the hex
    // Use half the hexagon radius for spawn area to avoid edge spawning
    const spawnRadius = gameConfig.hexagonRadius;
    const randomOffset = {
      x: (Math.random() - 0.5) * spawnRadius,
      y: (Math.random() - 0.5) * spawnRadius,
    };

    const spawnX = worldPos.x + randomOffset.x;
    const spawnY = worldPos.y + randomOffset.y;

    // 25% chance to spawn health pack, 25% ammo pack, 50% zombie
    const roll = Math.random();
    if (roll < this.HEALTH_PACK_CHANCE) {
      this.spawnHealthPack(spawnX, spawnY);
    } else if (roll < this.HEALTH_PACK_CHANCE + this.AMMO_PACK_CHANCE) {
      this.spawnAmmoPack(spawnX, spawnY);
    } else {
      this.spawnZombie(spawnX, spawnY);
    }
  }

  private spawnAmmoPack(x: number, y: number): void {
    const ammoPack = new AmmoPack(this.gameScene, x, y);

    // Add to the game scene's ammo packs array
    const gameScene = this.gameScene as any;
    if (gameScene.ammoPacks) {
      gameScene.ammoPacks.push(ammoPack);
    }
  }

  private spawnHealthPack(x: number, y: number): void {
    const healthPack = new HealthPack(this.gameScene, x, y);
    const gameScene = this.gameScene as any;
    if (gameScene.healthPacks) {
      gameScene.healthPacks.push(healthPack);
    }
  }

  private spawnZombie(x: number, y: number): void {
    this.zombieGroup.addZombie(x, y);
  }

  private getHexagonKey(hex: HexagonCoord): string {
    return `${hex.q},${hex.r}`;
  }
}
