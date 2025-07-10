import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private shootButton?: Phaser.GameObjects.Text;
  private weaponInfoText?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onDebugToggle?: () => void;
  private onShoot?: () => void;
  private onShootStart?: () => void;
  private onShootEnd?: () => void;
  private devicePixelRatio: number;
  private isShooting: boolean = false;

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

    // Create shoot button (bottom-right)
    this.shootButton = this.add.text(
      gameWidth - padding,
      this.cameras.main.height - padding - 40 * this.devicePixelRatio,
      "SHOOT",
      {
        fontSize: fontSize.button,
        color: "#ffffff",
        backgroundColor: "#cc0000",
        padding: {
          x: 12 * this.devicePixelRatio,
          y: 8 * this.devicePixelRatio,
        },
      }
    );
    this.shootButton.setOrigin(1, 1); // Bottom-right align
    this.shootButton.setScrollFactor(0);
    this.shootButton.setDepth(1000);
    this.shootButton.setInteractive({ useHandCursor: true });
    this.shootButton.on("pointerdown", () => {
      this.startShooting();
    });
    this.shootButton.on("pointerup", () => {
      this.stopShooting();
    });
    this.shootButton.on("pointerout", () => {
      this.stopShooting();
    });

    // Create weapon info text (top-left)
    this.weaponInfoText = this.add.text(padding, padding, "Pistol - ∞", {
      fontSize: fontSize.button,
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
    });
    this.weaponInfoText.setOrigin(0, 0); // Left-align
    this.weaponInfoText.setScrollFactor(0);
    this.weaponInfoText.setDepth(1000);
  }

  setDebugToggleCallback(callback: () => void): void {
    this.onDebugToggle = callback;
  }

  setShootCallback(callback: () => void): void {
    this.onShoot = callback;
  }

  setShootStartCallback(callback: () => void): void {
    this.onShootStart = callback;
  }

  setShootEndCallback(callback: () => void): void {
    this.onShootEnd = callback;
  }

  private toggleDebug(): void {
    if (this.onDebugToggle) {
      this.onDebugToggle();
    }
  }

  private shoot(): void {
    if (this.onShoot) {
      this.onShoot();
    }
  }

  private startShooting(): void {
    this.isShooting = true;
    if (this.onShootStart) {
      this.onShootStart();
    }
  }

  private stopShooting(): void {
    this.isShooting = false;
    if (this.onShootEnd) {
      this.onShootEnd();
    }
  }

  isShootingActive(): boolean {
    return this.isShooting;
  }

  updateDebugButtonText(isEnabled: boolean): void {
    if (this.debugButton && this.isVisible) {
      this.debugButton.setText(isEnabled ? "Debug: ON" : "Debug: OFF");
      this.debugButton.setStyle({
        backgroundColor: isEnabled ? "#006600" : "#333333",
      });
    }
  }

  updateWeaponInfo(weaponName: string, ammo: number): void {
    if (this.weaponInfoText && this.isVisible) {
      const ammoText = ammo === -1 ? "∞" : ammo.toString();
      this.weaponInfoText.setText(`${weaponName} - ${ammoText}`);
    }
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.debugButton) this.debugButton.setVisible(visible);
    if (this.shootButton) this.shootButton.setVisible(visible);
    if (this.weaponInfoText) this.weaponInfoText.setVisible(visible);
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

    if (this.shootButton) {
      this.shootButton.setPosition(
        gameWidth - padding,
        this.cameras.main.height - padding - 40 * this.devicePixelRatio
      );
    }
  }

  destroy(): void {
    if (this.debugButton) this.debugButton.destroy();
    if (this.shootButton) this.shootButton.destroy();
    if (this.weaponInfoText) this.weaponInfoText.destroy();
  }
}
