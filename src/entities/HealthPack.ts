import { PickableItem } from "./PickableItem";
import { Character } from "./Character";

export class HealthPack extends PickableItem {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = "health-pack"
  ) {
    super(scene, x, y, texture);
  }

  override checkPickup(player: Phaser.GameObjects.Sprite): boolean {
    const character = this.scene.children.list.find(
      (child) => child instanceof Character
    ) as Character;

    if (character && character.getHealth() >= character.getMaxHealth()) {
      return false;
    }

    return super.checkPickup(player);
  }

  protected onPickupComplete(): void {
    const character = this.scene.children.list.find(
      (child) => child instanceof Character
    ) as Character;

    if (character) {
      if (character.getHealth() < character.getMaxHealth()) {
        character.setHealth(
          Math.min(character.getHealth() + 1, character.getMaxHealth())
        );
      }
    }
  }
}
