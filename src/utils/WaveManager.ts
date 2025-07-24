import { GameScene } from "../scenes/GameScene";

interface WaveState {
  waveIndex: number;
  isGap: boolean;
}

export class WaveManager {
  private scene: GameScene;
  private timeSeconds: number = 0;
  private waveDurationSeconds: number = 30;
  private waveGapSeconds: number = 10;
  public onWaveStart: (waveIndex: number, waveSeconds: number) => void =
    () => {};
  public onWaveEnd: (waveIndex: number, gapSeconds: number) => void = () => {};

  constructor(scene: GameScene) {
    this.scene = scene;
    this.timeSeconds = 0;
  }

  reset() {
    this.timeSeconds = 0;
  }

  update(delta: number): void {
    const thenSeconds = this.timeSeconds;
    const nowSeconds = thenSeconds + delta * 0.001;
    this.timeSeconds = nowSeconds;
    this.handleStateChange(thenSeconds, nowSeconds);
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
      this.onWaveEnd(currentWaveState.waveIndex, this.waveGapSeconds);
    } else {
      this.onWaveStart(currentWaveState.waveIndex, this.waveDurationSeconds);
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
