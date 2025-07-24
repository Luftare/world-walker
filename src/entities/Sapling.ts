import { GameScene } from "../scenes/GameScene";
import { TweenHelpers } from "../utils/TweenHelpers";
import { AmmoPack } from "./AmmoPack";
import { CircularGameObject } from "./CircularGameObject";

export class Sapling extends CircularGameObject {
  public ageSeconds: number;
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 20, "sapling-0");
    this.ageSeconds = 0;
    this.setDepth(4);
    this.rotation = Math.random() * Math.PI * 2;
  }

  override update(delta: number) {
    this.ageSeconds += delta * 0.001;
    this.updateTexture();
    this.handleCompletion();
  }

  updateTexture() {
    const secondsPerTexture = 15;
    const textureCount = 3;
    const textureIndex = Math.min(
      textureCount - 1,
      Math.floor(this.ageSeconds / secondsPerTexture)
    );
    const texture = `sapling-${textureIndex}`;
    this.setTexture(texture);
  }

  handleCompletion() {
    if (this.ageSeconds >= 60) {
      this.scene.saplings = this.scene.saplings.filter((s) => s !== this);

      const count = Math.floor(Math.random() * 5) + 2;

      [...Array(count)].forEach(() => {
        this.spawnPotato();
      });
      this.destroy();
    }
  }

  spawnPotato() {
    const potato = new AmmoPack(this.scene, this.x, this.y);
    this.scene.pickableItems.push(potato);
    TweenHelpers.bounceAtRandomDirection(potato, this.scene);
  }
}
