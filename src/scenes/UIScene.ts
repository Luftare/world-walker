import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private shootButton?: Phaser.GameObjects.Text;
  private weaponInfoText?: Phaser.GameObjects.Text;
  private healthText?: Phaser.GameObjects.Text;
  private debugLogText?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onWeaponSwitch?: () => void;
  private devicePixelRatio: number;
  private isShooting: boolean = false;
  private debugLogTimer: Phaser.Time.TimerEvent | undefined;
  private reloadBar?: Phaser.GameObjects.Graphics;
  private reloadTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: "UIScene" });
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  create(): void {
    this.createUIElements();
    // Listen for playerShot event
    this.scene
      .get("GameScene")
      .events.on("playerShot", this.startReloadBar, this);
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

    // Create debug log text (bottom-left)
    this.debugLogText = this.add.text(
      padding,
      this.cameras.main.height * 0.5,
      "",
      {
        fontSize: fontSize.debug,
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
        wordWrap: { width: gameWidth - 2 * padding },
      }
    );
    this.debugLogText.setOrigin(0, 1); // Bottom-left align
    this.debugLogText.setScrollFactor(0);
    this.debugLogText.setDepth(1000);
    this.debugLogText.setVisible(false);

    // Create shoot button (bottom-right)
    this.shootButton = this.add.text(
      gameWidth - padding - 24 * this.devicePixelRatio,
      this.cameras.main.height - padding - 24 * this.devicePixelRatio,
      "PEW PEW!",
      {
        fontSize: fontSize.button,
        color: "#ffffff",
        backgroundColor: "#992222",
        padding: {
          x: 24 * this.devicePixelRatio,
          y: 24 * this.devicePixelRatio,
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

    // Create reload bar overlaying the shoot button
    if (this.shootButton) {
      this.reloadBar = this.add.graphics();
      this.reloadBar.fillStyle(0x444444, 0.8);
      this.reloadBar.fillRect(
        this.shootButton.x - this.shootButton.displayWidth,
        this.shootButton.y - this.shootButton.displayHeight,
        this.shootButton.displayWidth,
        this.shootButton.displayHeight
      );
      this.reloadBar.setDepth(1001);
      this.reloadBar.setScrollFactor(0);
      this.reloadBar.setVisible(false);
    }

    // Create weapon info text (top-left)
    this.weaponInfoText = this.add.text(padding, padding, "Potato Throw - ∞", {
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

    // Create health text (below weapon info)
    this.healthText = this.add.text(
      padding,
      padding + 40 * this.devicePixelRatio,
      "❤️❤️❤️❤️❤️",
      {
        fontSize: fontSize.score,
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
      }
    );
    this.healthText.setOrigin(0, 0); // Left-align
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(1000);
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

  updateHealthDisplay(currentHealth: number, maxHealth: number): void {
    if (this.healthText && this.isVisible) {
      const hearts =
        "❤️".repeat(currentHealth) + "🖤".repeat(maxHealth - currentHealth);
      this.healthText.setText(hearts);
    }
  }

  logDebug(message: string): void {
    if (!this.debugLogText) return;

    // Clear existing timer if it exists
    if (this.debugLogTimer) {
      this.debugLogTimer.destroy();
    }

    // Show the debug text and set the message
    this.debugLogText.setVisible(true);
    this.debugLogText.setText(message);

    // Set timer to hide the text after 10 seconds
    this.debugLogTimer = this.time.delayedCall(10000, () => {
      if (this.debugLogText) {
        this.debugLogText.setVisible(false);
      }
    });
  }

  clearDebugLog(): void {
    if (this.debugLogText) {
      this.debugLogText.setVisible(false);
    }
    if (this.debugLogTimer) {
      this.debugLogTimer.destroy();
      this.debugLogTimer = undefined;
    }
  }

  private startReloadBar(fireRate: number): void {
    if (!this.shootButton || !this.reloadBar) return;
    // Stop any existing tween
    if (this.reloadTween) {
      this.reloadTween.stop();
    }
    // Set bar to full width, visible, overlaying the button
    const x = this.shootButton.x - this.shootButton.displayWidth;
    const y = this.shootButton.y - this.shootButton.displayHeight;
    const width = this.shootButton.displayWidth;
    const height = this.shootButton.displayHeight;
    this.reloadBar.clear();
    this.reloadBar.fillStyle(0x444444, 0.8);
    this.reloadBar.fillRect(x, y, width, height);
    this.reloadBar.setVisible(true);
    // Animate bar width from full to 0 (right to left)
    this.reloadTween = this.tweens.add({
      targets: { w: width },
      w: 0,
      duration: fireRate,
      onUpdate: (_, target) => {
        const w = (target as any).w;
        this.reloadBar!.clear();
        this.reloadBar!.fillStyle(0x444444, 0.8);
        // Draw from right to left
        this.reloadBar!.fillRect(x + (width - w), y, w, height);
      },
      onComplete: () => {
        this.reloadBar!.setVisible(false);
      },
    });
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.debugButton) this.debugButton.setVisible(visible);
    if (this.shootButton) this.shootButton.setVisible(visible);
    if (this.weaponInfoText) this.weaponInfoText.setVisible(visible);
    if (this.healthText) this.healthText.setVisible(visible);
    if (this.debugLogText && visible === false) {
      this.debugLogText.setVisible(false);
    }
    if (this.reloadBar) this.reloadBar.setVisible(visible);
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
    if (this.shootButton && this.reloadBar) {
      this.reloadBar.setPosition(
        this.shootButton.x - this.shootButton.displayWidth,
        this.shootButton.y - this.shootButton.displayHeight
      );
    }
  }

  destroy(): void {
    if (this.debugButton) this.debugButton.destroy();
    if (this.shootButton) this.shootButton.destroy();
    if (this.weaponInfoText) this.weaponInfoText.destroy();
    if (this.healthText) this.healthText.destroy();
    if (this.debugLogText) this.debugLogText.destroy();
    if (this.debugLogTimer) this.debugLogTimer.destroy();
    if (this.reloadBar) this.reloadBar.destroy();
    if (this.reloadTween) this.reloadTween.stop();
  }
}
