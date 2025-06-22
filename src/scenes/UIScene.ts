import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";

export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private controlsText?: Phaser.GameObjects.Text;
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
    const gameHeight = this.cameras.main.height;
    const padding = 10 * this.devicePixelRatio;
    const fontSize = {
      debug: `${14 * this.devicePixelRatio}px`,
      score: `${16 * this.devicePixelRatio}px`,
      button: `${14 * this.devicePixelRatio}px`,
      controls: `${12 * this.devicePixelRatio}px`,
    };

    // Create debug text (top-left)
    this.debugText = this.add.text(padding, padding, "Debug Info", {
      fontSize: fontSize.debug,
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    // Create score text (top-right)
    this.scoreText = this.add.text(gameWidth - padding, padding, "Score: 0", {
      fontSize: fontSize.score,
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
    });
    this.scoreText.setOrigin(1, 0); // Right-align
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(1000);

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

    // Create controls text (bottom-left)
    this.controlsText = this.add.text(
      padding,
      gameHeight - padding,
      "Tap to move • WASD: Debug movement • Q/E: Rotate camera",
      {
        fontSize: fontSize.controls,
        color: "#cccccc",
        backgroundColor: "#000000",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
      }
    );
    this.controlsText.setOrigin(0, 1); // Bottom-left align
    this.controlsText.setScrollFactor(0);
    this.controlsText.setDepth(1000);
  }

  setDebugToggleCallback(callback: () => void): void {
    this.onDebugToggle = callback;
  }

  private toggleDebug(): void {
    if (this.onDebugToggle) {
      this.onDebugToggle();
    }
  }

  updateDebugInfo(info: string): void {
    if (this.debugText && this.isVisible) {
      this.debugText.setText(info);
    }
  }

  updateScore(score: number): void {
    if (this.scoreText && this.isVisible) {
      this.scoreText.setText(`Score: ${score}`);
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
    if (this.debugText) this.debugText.setVisible(visible);
    if (this.scoreText) this.scoreText.setVisible(visible);
    if (this.controlsText) this.controlsText.setVisible(visible);
    if (this.debugButton) this.debugButton.setVisible(visible);
  }

  toggleVisibility(): void {
    this.setVisible(!this.isVisible);
  }

  resize(): void {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const padding = 10 * this.devicePixelRatio;

    if (this.debugText) {
      this.debugText.setPosition(padding, padding);
    }

    if (this.scoreText) {
      this.scoreText.setPosition(gameWidth - padding, padding);
    }

    if (this.debugButton) {
      this.debugButton.setPosition(
        gameWidth - padding,
        padding + 40 * this.devicePixelRatio
      );
    }

    if (this.controlsText) {
      this.controlsText.setPosition(padding, gameHeight - padding);
    }
  }

  destroy(): void {
    if (this.debugText) this.debugText.destroy();
    if (this.scoreText) this.scoreText.destroy();
    if (this.controlsText) this.controlsText.destroy();
    if (this.debugButton) this.debugButton.destroy();
  }
}
