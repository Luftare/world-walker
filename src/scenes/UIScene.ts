import Phaser from "phaser";

// DEBUG: Extend Graphics type to include valueTexts property
interface CompassBarGraphics extends Phaser.GameObjects.Graphics {
  valueTexts?: Phaser.GameObjects.Text[];
}

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private shootButton?: Phaser.GameObjects.Text;
  private weaponInfoText?: Phaser.GameObjects.Text;
  private healthText?: Phaser.GameObjects.Text;
  private coinCounterText?: Phaser.GameObjects.Text;
  private isVisible: boolean = true;
  private onWeaponSwitch?: () => void;
  private devicePixelRatio: number;
  private isShooting: boolean = false;
  private coinCount: number = 0;

  // DEBUG: Compass buffer visualization elements
  private compassBufferContainer?: Phaser.GameObjects.Container;
  private compassBufferBars: CompassBarGraphics[] = [];
  private compassBufferText?: Phaser.GameObjects.Text;

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

    // Create coin counter text (top-right)
    this.coinCounterText = this.add.text(
      gameWidth - padding,
      padding,
      "Coins: 0",
      {
        fontSize: fontSize.score,
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
      }
    );
    this.coinCounterText.setOrigin(1, 0); // Right-align
    this.coinCounterText.setScrollFactor(0);
    this.coinCounterText.setDepth(1000);

    // DEBUG: Create compass buffer visualization
    this.createCompassBufferVisualization();
  }

  // DEBUG: Create compass buffer visualization UI
  private createCompassBufferVisualization(): void {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const dpr = this.devicePixelRatio;
    const padding = 10 * dpr;

    // Create container for compass buffer visualization
    this.compassBufferContainer = this.add.container(
      padding + 20 * dpr,
      gameHeight - padding - 100 * dpr
    );
    this.compassBufferContainer.setScrollFactor(0);
    this.compassBufferContainer.setDepth(1001);

    // Create title text
    this.compassBufferText = this.add.text(0, 0, "Compass Buffer:", {
      fontSize: `${12 * dpr}px`,
      color: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 4 * dpr, y: 2 * dpr },
    });
    this.compassBufferText.setOrigin(0, 0);
    this.compassBufferContainer.add(this.compassBufferText);

    // Create bars for each buffer slot (5 bars for BUFFER_SIZE)
    const barWidth = 20 * dpr;
    const barSpacing = 5 * dpr;

    for (let i = 0; i < 5; i++) {
      const bar = this.add.graphics();
      bar.setPosition(
        i * (barWidth + barSpacing),
        20 * dpr // Below the title text
      );
      this.compassBufferBars.push(bar);
      this.compassBufferContainer.add(bar);
    }
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

  addCoin(): void {
    this.coinCount++;
    this.updateCoinCounter();
  }

  private updateCoinCounter(): void {
    if (this.coinCounterText && this.isVisible) {
      this.coinCounterText.setText(`Coins: ${this.coinCount}`);
    }
  }

  getCoinCount(): number {
    return this.coinCount;
  }

  // DEBUG: Update compass buffer visualization
  updateCompassBuffer(headings: number[]): void {
    if (!this.compassBufferBars.length || !this.isVisible) return;

    const dpr = this.devicePixelRatio;
    const barWidth = 20 * dpr;
    const maxBarHeight = 50 * dpr;

    // Clear previous value texts
    this.clearCompassBufferTexts();

    // Clear all bars
    this.compassBufferBars.forEach((bar) => {
      if (bar) bar.clear();
    });

    // Update each bar based on heading values
    for (let i = 0; i < this.compassBufferBars.length; i++) {
      const bar = this.compassBufferBars[i];
      if (!bar) continue;
      const heading = headings[i] || 0;

      // Normalize heading (0-360) to bar height (0-50px)
      const normalizedHeight = (heading / 360) * maxBarHeight;

      // Draw bar from bottom up
      bar.fillStyle(0x00ff00, 0.8); // Green with transparency
      bar.fillRect(
        0,
        maxBarHeight - normalizedHeight,
        barWidth,
        normalizedHeight
      );

      // Draw border
      bar.lineStyle(2, 0xffffff, 1);
      bar.strokeRect(0, 0, barWidth, maxBarHeight);

      // Add value text on top of bar
      const valueText = this.add.text(
        bar.x + barWidth / 2,
        bar.y - 15 * dpr,
        Math.round(heading).toString(),
        {
          fontSize: `${10 * dpr}px`,
          color: "#ffffff",
        }
      );
      valueText.setOrigin(0.5, 0);
      valueText.setScrollFactor(0);
      valueText.setDepth(1002);

      // Store reference to remove later
      if (!bar.valueTexts) bar.valueTexts = [];
      bar.valueTexts.push(valueText);
    }
  }

  // DEBUG: Clear compass buffer value texts
  private clearCompassBufferTexts(): void {
    this.compassBufferBars.forEach((bar) => {
      if (bar.valueTexts) {
        bar.valueTexts.forEach((text) => text.destroy());
        bar.valueTexts = [];
      }
    });
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.debugButton) this.debugButton.setVisible(visible);
    if (this.shootButton) this.shootButton.setVisible(visible);
    if (this.weaponInfoText) this.weaponInfoText.setVisible(visible);
    if (this.healthText) this.healthText.setVisible(visible);
    if (this.coinCounterText) this.coinCounterText.setVisible(visible);
    // DEBUG: Update compass buffer visibility
    if (this.compassBufferContainer)
      this.compassBufferContainer.setVisible(visible);
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
    if (this.healthText) this.healthText.destroy();
    if (this.coinCounterText) this.coinCounterText.destroy();
    // DEBUG: Clean up compass buffer elements
    this.clearCompassBufferTexts();
    if (this.compassBufferContainer) this.compassBufferContainer.destroy();
  }
}
