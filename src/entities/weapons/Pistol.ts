import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";

export class Pistol extends Weapon {
  constructor() {
    super(-1, 500, 1, "Pistol"); // Unlimited ammo, 500ms fire rate, 1 damage
  }

  shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile
    const projectile = new Projectile(scene, x, y, direction);

    // Add to scene's projectile array
    const gameScene = scene as any;
    if (gameScene.projectiles) {
      gameScene.projectiles.push(projectile);
    }
  }
}
