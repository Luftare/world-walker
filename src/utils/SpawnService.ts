import { HexagonCoord, HexagonUtils } from "./HexagonUtils";
import { ZombieGroup } from "../entities/ZombieGroup";
import { gameConfig } from "../config/gameConfig";

export class SpawnService {
  private spawnState: Map<string, { timestamp: number; hasSpawned: boolean }> =
    new Map();
  private zombieGroup: ZombieGroup;
  private readonly RESPAWN_DELAY = 20000; // 20 seconds
  private readonly INITIAL_SAFE_HEXES = 0;
  private initialHexesDiscovered = 0;

  constructor(zombieGroup: ZombieGroup) {
    this.zombieGroup = zombieGroup;
  }

  handleHexDiscovered(hex: HexagonCoord): void {
    const hexKey = this.getHexagonKey(hex);
    const currentTime = Date.now();
    console.log("Hex discovered: ", hexKey);
    // Check if this is a rediscovery
    const existingState = this.spawnState.get(hexKey);

    if (existingState) {
      // Rediscovery - check if enough time has passed
      const timeSinceLastSpawn = currentTime - existingState.timestamp;
      if (timeSinceLastSpawn >= this.RESPAWN_DELAY) {
        this.spawnInHex(hex);
        this.spawnState.set(hexKey, {
          timestamp: currentTime,
          hasSpawned: true,
        });
      }
    } else {
      // First discovery
      this.initialHexesDiscovered++;

      if (this.initialHexesDiscovered > this.INITIAL_SAFE_HEXES) {
        // Spawn immediately for hexes beyond the initial safe zone
        this.spawnInHex(hex);
        this.spawnState.set(hexKey, {
          timestamp: currentTime,
          hasSpawned: true,
        });
      } else {
        // Mark as discovered but don't spawn for initial safe hexes
        this.spawnState.set(hexKey, {
          timestamp: currentTime,
          hasSpawned: false,
        });
      }
    }
  }

  private spawnInHex(hex: HexagonCoord): void {
    // Convert hex coordinates to scaled world coordinates for rendering
    const worldPos = HexagonUtils.hexagonToWorldScaled(hex.q, hex.r);

    // Add some randomness to the spawn position within the hex
    // Use half the hexagon radius for spawn area to avoid edge spawning
    const spawnRadius = gameConfig.hexagonRadius * gameConfig.scale * 0.5;
    const randomOffset = {
      x: (Math.random() - 0.5) * spawnRadius,
      y: (Math.random() - 0.5) * spawnRadius,
    };

    const spawnX = worldPos.x + randomOffset.x;
    const spawnY = worldPos.y + randomOffset.y;

    // Spawn a walking zombie
    this.zombieGroup.addZombie(spawnX, spawnY);
  }

  private getHexagonKey(hex: HexagonCoord): string {
    return `${hex.q},${hex.r}`;
  }
}
