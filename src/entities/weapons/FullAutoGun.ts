import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import type { GameScene } from "../../scenes/GameScene";

export class FullAutoGun extends Weapon {
  constructor() {
    super(150, 1, "SpudSower3000", 0.0025, 60, "character-spudblaster");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    // Create a single projectile with weapon damage
    const projectile = new Projectile(scene, x, y, direction, this.damage, 400);

    // Add to scene's projectile array
    scene.projectiles.push(projectile);

    scene.sound.play("fx-spud-sower-3000", {
      volume: 0.5,
    });
  }
}
