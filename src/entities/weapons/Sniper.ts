import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";

export class Sniper extends Weapon {
  constructor() {
    super(-1, 2000, 3, "Sniper", 0.005, 150);
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
