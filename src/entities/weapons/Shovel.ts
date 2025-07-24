import { Weapon } from "./Weapon";
import type { GameScene } from "../../scenes/GameScene";
import { Sapling } from "../Sapling";

export class Shovel extends Weapon {
  constructor() {
    super(4000, 1, "Plant-o-Spud", 0.004, 100, "character-no-gun");
  }

  shoot(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void {
    const sapling = new Sapling(scene, x, y);
    scene.saplings.push(sapling);
  }
}
