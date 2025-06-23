import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onDebugToggle?: () => void;
  private devicePixelRatio: number;

  constructor() {
    super({ key: "UIScene" });
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  create(): void {
    this.createUIElements();
  }

  private createUIElements(): void {
    const gameWidth = this.cameras.main.width;
    const dpr = this.devicePixelRatio;
    const padding = 10 * dpr;
    const fontSize = {
      debug: `${14 * dpr}px`,
      score: `${16 * dpr}px`,
      button: `${14 * dpr}px`,
      controls: `${12 * dpr}px`,
    };

    // Create toggle debug button (top-right, below score)
    const initialDebugState = gameConfig.devMode;
    this.debugButton = this.add.text(
      gameWidth - padding,
      padding + 40 * this.devicePixelRatio,
      initialDebugState ? "Debug: ON" : "Debug: OFF",
      {
        fontSize: fontSize.button,
        color: "#ffffff",
        backgroundColor: initialDebugState ? "#006600" : "#333333",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
      }
    );
    this.debugButton.setOrigin(1, 0); // Right-align
    this.debugButton.setScrollFactor(0);
    this.debugButton.setDepth(1000);
    this.debugButton.setInteractive({ useHandCursor: true });
    this.debugButton.on("pointerdown", () => {
      this.toggleDebug();
    });
  }

  setDebugToggleCallback(callback: () => void): void {
    this.onDebugToggle = callback;
  }

  private toggleDebug(): void {
    if (this.onDebugToggle) {
      this.onDebugToggle();
    }
  }

  updateDebugButtonText(isEnabled: boolean): void {
    if (this.debugButton && this.isVisible) {
      this.debugButton.setText(isEnabled ? "Debug: ON" : "Debug: OFF");
      this.debugButton.setStyle({
        backgroundColor: isEnabled ? "#006600" : "#333333",
      });
    }
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.debugButton) this.debugButton.setVisible(visible);
  }

  toggleVisibility(): void {
    this.setVisible(!this.isVisible);
  }

  resize(): void {
    const gameWidth = this.cameras.main.width;
    const padding = 10 * this.devicePixelRatio;

    if (this.debugButton) {
      this.debugButton.setPosition(
        gameWidth - padding,
        padding + 40 * this.devicePixelRatio
      );
    }
  }

  destroy(): void {
    if (this.debugButton) this.debugButton.destroy();
  }
}
