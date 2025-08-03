import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import type { GameScene } from "../../scenes/GameScene";

export class Shotgun extends Weapon {
  static override id: string = "SpudMultiplier";

  constructor(scene: GameScene) {
    super(scene, 2000, 35, "SpudMultiplier", 0.006, 120, "character-multi-gun");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create 3 projectiles in a fan pattern
    const spreadAngle = Math.PI / 20;
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
        this.damage,
        200
      );

      // Add to scene's projectile array
      scene.projectiles.push(projectile);

      scene.sound.play("fx-spud-multiplier", {
        volume: 0.5,
      });
    }
  }
}
