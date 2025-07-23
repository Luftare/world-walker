import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import { Character } from "../Character";
import type { GameScene } from "../../scenes/GameScene";

export class Sniper extends Weapon {
  constructor() {
    super(4000, 3, "SpudThunder", 0.006, 150, "character-thunder");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile with weapon damage
    const projectile = new Projectile(
      scene,
      x,
      y,
      direction,
      this.damage,
      800,
      true
    );

    // Apply pushback to the character
    const character = scene.children
      .getChildren()
      .find((c) => c instanceof Character) as Character;
    if (character) {
      // direction is a vector2, opposite of where the character is facing
      const impulse = new Phaser.Math.Vector2(1, 0)
        .rotate(character.rotation + Math.PI)
        .normalize()
        .scale(600);
      character.applyPushback(impulse);
    }

    // Add to scene's projectile array
    scene.projectiles.push(projectile);
  }
}
