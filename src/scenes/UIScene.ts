import Phaser from "phaser";
import { Throw } from "../entities/weapons/Throw";
import { Shovel } from "../entities/weapons/Shovel";
import { Pistol } from "../entities/weapons/Pistol";
import { FullAutoGun } from "../entities/weapons/FullAutoGun";
import { Shotgun } from "../entities/weapons/Shotgun";
import { Sniper } from "../entities/weapons/Sniper";

export class UIScene extends Phaser.Scene {
  private debugButton?: Phaser.GameObjects.Text;
  private shootButton?: Phaser.GameObjects.Text;
  private weaponInfoText?: Phaser.GameObjects.Text;
  private healthText?: Phaser.GameObjects.Text;
  private debugLogText?: Phaser.GameObjects.Text;
  private ammoDisplay?: Phaser.GameObjects.Container;
  private weaponModal?: Phaser.GameObjects.Container;
  private modalAmmoCountText?: Phaser.GameObjects.Text;
  private weaponListItems: Phaser.GameObjects.GameObject[] = [];
  private currentAmmo: number = 0;
  private isVisible: boolean = true;
  private isModalOpen: boolean = false;
  private devicePixelRatio: number;
  private isShooting: boolean = false;
  private debugLogTimer: Phaser.Time.TimerEvent | undefined;
  private reloadBar?: Phaser.GameObjects.Graphics;
  private reloadTween?: Phaser.Tweens.Tween;
  private weaponSelectionCallback?: (weaponId: string) => void;

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
      this.toggleWeaponModal();
    });

    // Create ammo display (top-right)
    this.createAmmoDisplay(gameWidth, padding, fontSize);

    // Create weapon modal
    this.createWeaponModal(gameWidth);

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

  private createAmmoDisplay(
    gameWidth: number,
    padding: number,
    fontSize: any
  ): void {
    const potatoImage = this.add.image(0, 0, "ammo-pack");
    potatoImage.setDisplaySize(48, 48);
    potatoImage.setOrigin(0, 0.5);

    const ammoText = this.add.text(
      potatoImage.displayWidth + 8 * this.devicePixelRatio,
      0,
      "∞",
      {
        fontSize: fontSize.score,
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 8 * this.devicePixelRatio, y: 4 * this.devicePixelRatio },
      }
    );
    ammoText.setOrigin(0, 0.5); // Left-center align

    this.ammoDisplay = this.add.container(
      gameWidth -
        padding -
        potatoImage.displayWidth -
        ammoText.displayWidth -
        32 * this.devicePixelRatio,
      padding + 16 * this.devicePixelRatio,
      [potatoImage, ammoText]
    );
    this.ammoDisplay.setScrollFactor(0);
    this.ammoDisplay.setDepth(1000);
  }

  private createWeaponModal(gameWidth: number): void {
    const modalWidth = gameWidth - 32 * this.devicePixelRatio;
    const modalHeight = (window.innerHeight - 32) * this.devicePixelRatio; // Increased height to accommodate items
    const modalX = (gameWidth - modalWidth) / 2;
    const modalY = 16 * this.devicePixelRatio;

    // Create modal background
    const modalBg = this.add.graphics();
    modalBg.fillStyle(0xf5f5dc, 0.95); // Light beige background
    modalBg.lineStyle(4 * this.devicePixelRatio, 0x000000); // Black border
    modalBg.fillRoundedRect(
      modalX,
      modalY,
      modalWidth,
      modalHeight,
      20 * this.devicePixelRatio
    );
    modalBg.strokeRoundedRect(
      modalX,
      modalY,
      modalWidth,
      modalHeight,
      20 * this.devicePixelRatio
    );

    // Create header
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0xf0f0e0, 0.95); // Slightly darker beige
    headerBg.lineStyle(2 * this.devicePixelRatio, 0x000000);
    headerBg.fillRoundedRect(
      modalX + 10 * this.devicePixelRatio,
      modalY + 10 * this.devicePixelRatio,
      modalWidth - 20 * this.devicePixelRatio,
      60 * this.devicePixelRatio,
      10 * this.devicePixelRatio
    );
    headerBg.strokeRoundedRect(
      modalX + 10 * this.devicePixelRatio,
      modalY + 10 * this.devicePixelRatio,
      modalWidth - 20 * this.devicePixelRatio,
      60 * this.devicePixelRatio,
      10 * this.devicePixelRatio
    );

    // // Create weapon icon in header
    // const weaponIcon = this.add.image(
    //   modalX + 30 * this.devicePixelRatio,
    //   modalY + 40 * this.devicePixelRatio,
    //   "character-throw"
    // );
    // weaponIcon.setScale(0.225 * this.devicePixelRatio); // 0.75x of 0.3

    // Create weapon name in header
    const weaponName = this.add.text(
      modalX + 25 * this.devicePixelRatio,
      modalY + 30 * this.devicePixelRatio,
      "Inventory",
      {
        fontSize: `${18 * this.devicePixelRatio}px`,
        color: "#000000",
        fontStyle: "bold",
      }
    );

    // Create ammo count in header
    const ammoIcon = this.add.image(
      modalX + modalWidth - 80 * this.devicePixelRatio,
      modalY + 40 * this.devicePixelRatio,
      "ammo-pack"
    );
    ammoIcon.setScale(0.2 * this.devicePixelRatio); // 0.5x of 0.4
    ammoIcon.setOrigin(1, 0.5);

    this.modalAmmoCountText = this.add.text(
      modalX + modalWidth - 70 * this.devicePixelRatio,
      modalY + 40 * this.devicePixelRatio,
      "x15",
      {
        fontSize: `${18 * this.devicePixelRatio}px`,
        color: "#000000",
      }
    );

    this.modalAmmoCountText.setOrigin(0, 0.5);

    // Create weapon list container
    const listContainer = this.add.graphics();
    listContainer.fillStyle(0xe0e0d0, 0.95); // Light gray background
    listContainer.lineStyle(2 * this.devicePixelRatio, 0x000000);
    listContainer.fillRoundedRect(
      modalX + 10 * this.devicePixelRatio,
      modalY + 80 * this.devicePixelRatio,
      modalWidth - 20 * this.devicePixelRatio,
      modalHeight - 140 * this.devicePixelRatio, // Increased space for close button
      10 * this.devicePixelRatio
    );
    listContainer.strokeRoundedRect(
      modalX + 10 * this.devicePixelRatio,
      modalY + 80 * this.devicePixelRatio,
      modalWidth - 20 * this.devicePixelRatio,
      modalHeight - 140 * this.devicePixelRatio, // Increased space for close button
      10 * this.devicePixelRatio
    );

    // Create close button
    const closeButton = this.add.text(
      modalX + modalWidth / 2,
      modalY + modalHeight - 30 * this.devicePixelRatio,
      "Close",
      {
        fontSize: `${20 * this.devicePixelRatio}px`,
        color: "#000000",
        backgroundColor: "#f0f0e0",
        padding: {
          x: 20 * this.devicePixelRatio,
          y: 10 * this.devicePixelRatio,
        },
      }
    );
    closeButton.setOrigin(0.5, 0.5);
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on("pointerdown", () => {
      this.closeWeaponModal();
    });

    // Create modal container (without weapon items initially)
    this.weaponModal = this.add.container(0, 0, [
      modalBg,
      headerBg,
      // weaponIcon,
      weaponName,
      ammoIcon,
      this.modalAmmoCountText,
      listContainer,
      closeButton,
    ]);
    this.weaponModal.setScrollFactor(0);
    this.weaponModal.setDepth(2000);
    this.weaponModal.setVisible(false);
  }

  private createWeaponListItems(
    modalX: number,
    modalY: number,
    modalWidth: number
  ): Phaser.GameObjects.Text[] {
    const unlockedWeapons = this.getUnlockedWeapons();
    const currentAmmo = this.getCurrentAmmo();

    const weapons = [
      {
        name: "Throw-a-Spud",
        icon: "character-throw",
        unlocked: unlockedWeapons.has(Throw.id),
        cost: 0,
        id: Throw.id,
      },
      {
        name: "Plant-a-Spud",
        icon: "character-no-gun",
        unlocked: unlockedWeapons.has(Shovel.id),
        cost: 10,
        id: Shovel.id,
      },
      {
        name: "SpudBlaster",
        icon: "character-auto-gun",
        unlocked: unlockedWeapons.has(Pistol.id),
        cost: 20,
        id: Pistol.id,
      },
      {
        name: "SpudSower3000",
        icon: "character-spudblaster",
        unlocked: unlockedWeapons.has(FullAutoGun.id),
        cost: 30,
        id: FullAutoGun.id,
      },
      {
        name: "Spud Multiplier",
        icon: "character-multi-gun",
        unlocked: unlockedWeapons.has(Shotgun.id),
        cost: 50,
        id: Shotgun.id,
      },
      {
        name: "Spud Thunder",
        icon: "character-thunder",
        unlocked: unlockedWeapons.has(Sniper.id),
        cost: 100,
        id: Sniper.id,
      },
    ];

    const items: Phaser.GameObjects.Text[] = [];
    const itemHeight = 35 * this.devicePixelRatio; // Slightly smaller items
    const startY = modalY + 100 * this.devicePixelRatio;

    weapons.forEach((weapon, index) => {
      const itemY = startY + index * itemHeight;
      const canAfford = currentAmmo >= weapon.cost;
      const isLocked = !weapon.unlocked;

      // Create weapon icon
      const weaponIcon = this.add.image(
        modalX + 30 * this.devicePixelRatio,
        itemY + itemHeight / 2,
        weapon.icon
      );
      weaponIcon.setScale(0.1 * this.devicePixelRatio);

      items.push(weaponIcon as any);

      // Create weapon name with lock emoji for locked weapons
      const displayName = isLocked ? `🔒 ${weapon.name}` : weapon.name;
      const weaponName = this.add.text(
        modalX + 70 * this.devicePixelRatio, // Adjusted for smaller icon
        itemY + 10 * this.devicePixelRatio,
        displayName,
        {
          fontSize: `${14 * this.devicePixelRatio}px`,
          color: weapon.unlocked ? "#000000" : "#666666",
        }
      );

      items.push(weaponName);

      if (!weapon.unlocked) {
        const costIcon = this.add.image(
          modalX + modalWidth - 80 * this.devicePixelRatio,
          itemY + itemHeight / 2,
          "ammo-pack"
        );
        costIcon.setScale(0.15 * this.devicePixelRatio); // 0.5x of 0.3

        items.push(costIcon as any);

        const costText = this.add.text(
          modalX + modalWidth - 50 * this.devicePixelRatio,
          itemY + 10 * this.devicePixelRatio,
          `x${weapon.cost}`,
          {
            fontSize: `${12 * this.devicePixelRatio}px`,
            color: canAfford ? "#444444" : "#ff4444",
          }
        );

        items.push(costText);
      }

      // Make item interactive for all weapons
      weaponName.setInteractive({ useHandCursor: true });
      weaponName.on("pointerdown", () => {
        this.selectWeapon(weapon.id);
      });
    });

    return items;
  }

  private toggleWeaponModal(): void {
    if (this.isModalOpen) {
      this.closeWeaponModal();
    } else {
      this.openWeaponModal();
    }
  }

  private openWeaponModal(): void {
    if (this.weaponModal && this.isVisible) {
      // Clear existing weapon list items
      this.clearWeaponListItems();

      // Create fresh weapon list items
      const gameWidth = this.cameras.main.width;
      const modalWidth = gameWidth - 32 * this.devicePixelRatio;
      const modalX = (gameWidth - modalWidth) / 2;
      const modalY = 16 * this.devicePixelRatio;

      this.weaponListItems = this.createWeaponListItems(
        modalX,
        modalY,
        modalWidth
      );

      // Add weapon items to modal
      this.weaponModal.add(this.weaponListItems);

      this.weaponModal.setVisible(true);
      this.isModalOpen = true;
      // Update modal ammo count when opening
      this.updateModalAmmoCount(this.currentAmmo);
    }
  }

  private closeWeaponModal(): void {
    if (this.weaponModal) {
      this.weaponModal.setVisible(false);
      this.isModalOpen = false;
    }
  }

  private selectWeapon(weaponId: string): void {
    if (this.weaponSelectionCallback) {
      this.weaponSelectionCallback(weaponId);
    }
    this.closeWeaponModal();
  }

  private startShooting(): void {
    this.isShooting = true;
  }

  private stopShooting(): void {
    this.isShooting = false;
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
      this.weaponInfoText.setText(weaponName);
    }
    this.currentAmmo = ammo;
    this.updateAmmoDisplay(ammo);
    this.updateModalAmmoCount(ammo);
  }

  private updateAmmoDisplay(ammo: number): void {
    if (!this.ammoDisplay || !this.isVisible) return;

    const ammoText = this.ammoDisplay.getAt(1) as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(ammo.toString());
    }
  }

  private updateModalAmmoCount(ammo: number): void {
    if (this.modalAmmoCountText) {
      this.modalAmmoCountText.setText(`x${ammo}`);
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
    if (this.ammoDisplay) this.ammoDisplay.setVisible(visible);
    if (this.weaponModal && !visible) {
      this.weaponModal.setVisible(false);
      this.isModalOpen = false;
      this.clearWeaponListItems();
    }
  }

  toggleVisibility(): void {
    this.setVisible(!this.isVisible);
  }

  setWeaponSelectionCallback(callback: (weaponId: string) => void): void {
    this.weaponSelectionCallback = callback;
  }

  setWeaponSwitchCallback(_callback: () => void): void {
    // This method is called from GameScene but not used in UIScene
    // The weapon switching is handled through the weapon selection callback
  }

  private getUnlockedWeapons(): Set<string> {
    const gameScene = this.scene.get("GameScene") as any;
    if (!gameScene?.character) return new Set([Throw.id]); // Default to throw weapon

    const weaponInventory = gameScene.character.getWeaponInventory();
    const unlockedWeapons = new Set<string>();

    // Add all weapons in the inventory
    weaponInventory.getAllWeapons().forEach((weapon: any) => {
      unlockedWeapons.add(weapon.constructor.id);
    });

    return unlockedWeapons;
  }

  private getCurrentAmmo(): number {
    const gameScene = this.scene.get("GameScene") as any;
    if (!gameScene?.character) return 0;

    return gameScene.character.getWeaponInventory().getAmmo();
  }

  private clearWeaponListItems(): void {
    // Remove existing weapon list items from modal
    if (this.weaponModal) {
      this.weaponListItems.forEach((item) => {
        this.weaponModal!.remove(item);
        item.destroy();
      });
    }
    this.weaponListItems = [];
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
    if (this.ammoDisplay) this.ammoDisplay.destroy();
    this.clearWeaponListItems();
    if (this.weaponModal) this.weaponModal.destroy();
  }
}
