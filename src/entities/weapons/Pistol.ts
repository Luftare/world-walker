import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";

export class Pistol extends Weapon {
  constructor() {
    super(-1, 500, 1, "Pistol", 0.002, 80); // Light shake for pistol
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
