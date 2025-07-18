import { GameScene } from "../scenes/GameScene";
import { Point } from "../types/types";

export class CircularGameObject extends Phaser.Physics.Arcade.Sprite {
  public radius: number;
  public override scene: GameScene;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    radius: number,
    texture: string
  ) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.radius = radius;
    this.setPosition(x, y);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPosition(x, y);
    this.setDisplaySize(radius * 2, radius * 2);
    this.setDepth(10);
    this.setOrigin(0.5, 0.5);
    this.setCircle(radius);

    if (this.body) {
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }

    this.setDisplaySize(this.radius * 2, this.radius * 2);
  }

  public getPosition(): Point {
    return { x: this.x, y: this.y };
  }
}
