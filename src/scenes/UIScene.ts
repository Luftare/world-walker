import { gameConfig } from "../config/gameConfig";

export class UIScene extends Phaser.Scene {
  private debugText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private controlsText?: Phaser.GameObjects.Text;
  private debugButton?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onDebugToggle?: (enabled: boolean) => void;

  constructor() {
    super({ key: "UIScene" });
  }

  override create(): void {
    this.createUIElements();
  }

  private createUIElements(): void {
    // Create debug text (top-left)
    this.debugText = this.add.text(10, 10, "Debug Info", {
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 },
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    // Create score text (top-right)
    this.scoreText = this.add.text(600, 10, "Score: 0", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 },
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(1000);

    // Create toggle debug button (top-right, below score)
    const initialDebugState = gameConfig.devMode;
    this.debugButton = this.add.text(
      600,
      50,
      initialDebugState ? "Debug: ON" : "Debug: OFF",
      {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: initialDebugState ? "#006600" : "#333333",
        padding: { x: 8, y: 4 },
      }
    );
    this.debugButton.setScrollFactor(0);
    this.debugButton.setDepth(1000);
    this.debugButton.setInteractive({ useHandCursor: true });
    this.debugButton.on("pointerdown", () => {
      this.toggleDebug();
    });

    // Create controls text (bottom-left)
    this.controlsText = this.add.text(
      10,
      550,
      "Tap to move • WASD: Debug movement • Q/E: Rotate camera",
      {
        fontSize: "12px",
        color: "#cccccc",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      }
    );
    this.controlsText.setScrollFactor(0);
    this.controlsText.setDepth(1000);
  }

  setDebugToggleCallback(callback: (enabled: boolean) => void): void {
    this.onDebugToggle = callback;
  }

  private toggleDebug(): void {
    if (this.onDebugToggle) {
      this.onDebugToggle(true); // This will be toggled in the callback
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

  destroy(): void {
    if (this.debugText) this.debugText.destroy();
    if (this.scoreText) this.scoreText.destroy();
    if (this.controlsText) this.controlsText.destroy();
    if (this.debugButton) this.debugButton.destroy();
  }
}
