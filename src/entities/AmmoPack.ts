import { PickableItem } from "./PickableItem";
import { Character } from "./Character";

export class AmmoPack extends PickableItem {
  private ammoAmount: number = 7;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = "ammo-pack"
  ) {
    super(scene, x, y, texture);
  }

  protected onPickupComplete(): void {
    // Find the character in the scene and add ammo
    const character = this.scene.children.list.find(
      (child) => child instanceof Character
    ) as Character;

    if (character) {
      character.getWeaponInventory().addAmmo(this.ammoAmount);
    }
  }

  setAmmoAmount(amount: number): void {
    this.ammoAmount = amount;
  }

  getAmmoAmount(): number {
    return this.ammoAmount;
  }
}
