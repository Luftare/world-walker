import { PickableItem } from "./PickableItem";

export class Cogwheel extends PickableItem {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "cogwheel");
  }

  protected onPickupComplete(): void {
    this.scene.events.emit("cogwheelPickedUp");
  }
}
