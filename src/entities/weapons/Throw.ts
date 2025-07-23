import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import type { GameScene } from "../../scenes/GameScene";

export class Throw extends Weapon {
  constructor() {
    super(800, 1, "Throw-a-Spud", 0, 10, "character-throw");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile with weapon damage
    const projectile = new Projectile(scene, x, y, direction, this.damage, 150);

    // Add to scene's projectile array
    scene.projectiles.push(projectile);

    scene.sound.play("fx-throw", {
      volume: 0.5,
    });
  }
}
