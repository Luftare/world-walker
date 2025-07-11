import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private shootButton?: Phaser.GameObjects.Text;
  private weaponInfoText?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onWeaponSwitch?: () => void;
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
      button: `${24 * dpr}px`,
      controls: `${12 * dpr}px`,
    };

    // Create shoot button (bottom-right)
    this.shootButton = this.add.text(
      gameWidth - padding - 40 * this.devicePixelRatio,
      this.cameras.main.height - padding - 40 * this.devicePixelRatio,
      "SHOOT",
      {
        fontSize: fontSize.button,
        color: "#ffffff",
        backgroundColor: "#cc0000",
        padding: {
          x: 32 * this.devicePixelRatio,
          y: 32 * this.devicePixelRatio,
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
    this.weaponInfoText.setInteractive({ useHandCursor: true });
    this.weaponInfoText.on("pointerdown", () => {
      this.switchWeapon();
    });
  }

  setWeaponSwitchCallback(callback: () => void): void {
    this.onWeaponSwitch = callback;
  }

  private startShooting(): void {
    this.isShooting = true;
  }

  private stopShooting(): void {
    this.isShooting = false;
  }

  private switchWeapon(): void {
    if (this.onWeaponSwitch) {
      this.onWeaponSwitch();
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
      this.weaponInfoText.setText(`${weaponName} - ${ammo}`);
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
