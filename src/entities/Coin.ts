import { PickableItem } from "./PickableItem";

export class Coin extends PickableItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "coin");
  }

  protected onPickupComplete(): void {
    // Emit event to notify game scene that coin was picked up
    this.scene.events.emit("coinPickedUp");
  }
}
