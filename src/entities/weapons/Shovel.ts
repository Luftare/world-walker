import { Weapon } from "./Weapon";
import type { GameScene } from "../../scenes/GameScene";
import { Sapling } from "../Sapling";
import { gameConfig } from "../../config/gameConfig";

export class Shovel extends Weapon {
  static override id: string = "plant-a-spud";

  constructor(scene: GameScene) {
    super(scene, 1000, 1, "Plant-o-Spud", 0.004, 100, "character-no-gun");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    _direction: { x: number; y: number }
  ): void {
    const sapling = new Sapling(scene, x, y);
    scene.saplings.push(sapling);
  }

  override canShoot(currentTime: number): boolean {
    if (!super.canShoot(currentTime)) return false;
    if (!this.scene.character || this.scene.saplings.length === 0) return true;
    const { x, y } = this.scene.character;
    const saplingDistances = this.scene.saplings.map((s) =>
      Phaser.Math.Distance.Between(x, y, s.x, s.y)
    );

    const minDistance = Math.min(...saplingDistances);
    return minDistance > gameConfig.saplingRadius * 2;
  }
}
