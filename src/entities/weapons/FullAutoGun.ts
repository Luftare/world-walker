import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";

export class FullAutoGun extends Weapon {
  constructor() {
    super(150, 1, "Full Auto Gun", 0.002, 60); // Medium shake for full auto
  }

  shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile with weapon damage
    const projectile = new Projectile(scene, x, y, direction, this.damage);

    // Add to scene's projectile array
    const gameScene = scene as any;
    if (gameScene.projectiles) {
      gameScene.projectiles.push(projectile);
    }
  }
}
