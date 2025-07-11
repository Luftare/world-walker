import { PickableItem } from "./PickableItem";
import { gameConfig } from "../config/gameConfig";

export class Coin extends PickableItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "coin");

    // Store the target display size
    const targetSize = gameConfig.playerRadius * 2;

    // Start with very small display size for bounce effect
    this.setDisplaySize(targetSize * 0.01, targetSize * 0.01);

    // Create bounce animation to full size
    this.scene.tweens.add({
      targets: this,
      displayWidth: targetSize,
      displayHeight: targetSize,
      duration: 300,
      ease: "Bounce.easeOut",
    });
  }

  protected onPickupComplete(): void {
    // Emit event to notify game scene that coin was picked up
    this.scene.events.emit("coinPickedUp");
  }
}
