import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import { Character } from "../Character";

export class Sniper extends Weapon {
  constructor() {
    super(2000, 3, "Sniper", 0.005, 150);
  }

  shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile with weapon damage
    const projectile = new Projectile(scene, x, y, direction, this.damage);

    // Apply pushback to the character
    const character = scene.children
      .getChildren()
      .find((c) => c instanceof Character) as Character;
    if (character) {
      console.log("PUSHBACK");
      // direction is a vector2, opposite of where the character is facing
      const direction = new Phaser.Math.Vector2(1, 0).rotate(
        character.rotation + Math.PI
      );
      character.applyPushback(direction, 500);
    }

    // Add to scene's projectile array
    const gameScene = scene as any;
    if (gameScene.projectiles) {
      gameScene.projectiles.push(projectile);
    }
  }
}
