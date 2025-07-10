import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";

export class Shotgun extends Weapon {
  constructor() {
    super(-1, 800, 1, "Shotgun", 0.006, 120); // Medium fire rate, medium damage, heavy shake
  }

  shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create 3 projectiles in a fan pattern
    const spreadAngle = Math.PI / 15;
    const angles = [-spreadAngle, 0, spreadAngle];

    for (const angle of angles) {
      // Rotate the base direction by the spread angle
      const rotatedDirection = {
        x: direction.x * Math.cos(angle) - direction.y * Math.sin(angle),
        y: direction.x * Math.sin(angle) + direction.y * Math.cos(angle),
      };

      // Create projectile with weapon damage
      const projectile = new Projectile(
        scene,
        x,
        y,
        rotatedDirection,
        this.damage
      );

      // Add to scene's projectile array
      const gameScene = scene as any;
      if (gameScene.projectiles) {
        gameScene.projectiles.push(projectile);
      }
    }
  }
}
