import { GameScene } from "../scenes/GameScene";
import { Point } from "../types/types";

interface WaveState {
  waveIndex: number;
  isGap: boolean;
}

export class WaveManager {
  private scene: GameScene;
  private timeSeconds: number = 0;
  private lastSpawnTimeSeconds: number = 0;
  private waveDurationSeconds: number = 30;
  private waveGapSeconds: number = 60;
  public onWaveStart:
    | ((waveIndex: number, waveSeconds: number) => void)
    | undefined;

  public onWaveEnd:
    | ((waveIndex: number, gapSeconds: number) => void)
    | undefined;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.timeSeconds = 0;
  }

  reset() {
    this.timeSeconds = 0;
    this.lastSpawnTimeSeconds = 0;
  }

  update(delta: number): void {
    const thenSeconds = this.timeSeconds;
    const nowSeconds = thenSeconds + delta * 0.001;
    this.timeSeconds = nowSeconds;
    this.handleStateChange(thenSeconds, nowSeconds);
    this.handleWaveSpawning();
  }

  handleWaveSpawning() {
    const { waveIndex, isGap } = this.getWaveStateAt(this.timeSeconds);
    if (isGap) return;

    const isSpawnReady = this.checkIsSpawnReady(waveIndex);
    if (!isSpawnReady) return;

    this.spawn();
  }

  spawn() {
    this.lastSpawnTimeSeconds = this.timeSeconds;
    if (!this.scene.zombieGroup) return;

    const zombiePosition = this.getRandomPositionAroundCharacter();
    const zombie = this.scene.zombieGroup?.addZombie(
      zombiePosition.x,
      zombiePosition.y
    );
    if (zombie && this.scene.character) {
      zombie.setAggro(this.scene.character);
    }
  }

  getRandomPositionAroundCharacter(): Point {
    if (!this.scene.character) return { x: 0, y: 0 };

    const angle = Math.random() * Math.PI * 2;
    const distance = 500;
    return {
      x: this.scene.character.x + Math.cos(angle) * distance,
      y: this.scene.character.y + Math.sin(angle) * distance,
    };
  }

  getSpawnGapSeconds(waveIndex: number): number {
    return Math.max(0.25, 6 - waveIndex * 0.5);
  }

  checkIsSpawnReady(waveIndex: number): boolean {
    const spawnGap = this.getSpawnGapSeconds(waveIndex);
    const secondsSinceLastSpawn = this.timeSeconds - this.lastSpawnTimeSeconds;
    return spawnGap <= secondsSinceLastSpawn;
  }

  handleStateChange(thenSeconds: number, nowSeconds: number) {
    const previousWaveState = this.getWaveStateAt(thenSeconds);
    const currentWaveState = this.getWaveStateAt(nowSeconds);

    const indexMatches =
      previousWaveState.waveIndex === currentWaveState.waveIndex;
    const isGapMatches = previousWaveState.isGap === currentWaveState.isGap;

    if (indexMatches && isGapMatches) {
      return;
    }

    if (!indexMatches) {
      if (this.onWaveEnd) {
        this.onWaveEnd(currentWaveState.waveIndex, this.waveGapSeconds);
      }
    } else {
      if (this.onWaveStart) {
        this.onWaveStart(currentWaveState.waveIndex, this.waveDurationSeconds);
      }
    }
  }

  getWaveStateAt(seconds: number): WaveState {
    const fullCycleSeconds = this.waveGapSeconds + this.waveDurationSeconds;
    const waveIndex = Math.floor(seconds / fullCycleSeconds);
    const cycleLocalSeconds = seconds % fullCycleSeconds;
    const isGap = cycleLocalSeconds < this.waveGapSeconds;

    return { waveIndex, isGap };
  }
}
