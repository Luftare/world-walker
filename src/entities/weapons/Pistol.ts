import { Weapon } from "./Weapon";
import { Projectile } from "../Projectile";
import type { GameScene } from "../../scenes/GameScene";

export class Pistol extends Weapon {
  static override id: string = "spud-blaster";

  constructor(scene: GameScene) {
    super(scene, 600, 35, "SpudBlaster", 0.002, 80, "character-auto-gun");
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

    scene.sound.play("fx-spud-blaster", {
      volume: 0.5,
    });
  }
}
