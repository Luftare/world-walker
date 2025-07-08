import { gameConfig } from "../config/gameConfig";

export class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    texture: string = "compass-circle"
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    console.log(scene);
    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(10);
    if (this.body) {
      // We use the sprite size for the physics body and later scale it to the correct size
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }
    const radius = gameConfig.playerRadius * gameConfig.scale;
    this.setDisplaySize(radius * 2, radius * 2);
  }

  override setPosition(x: number, y: number): this {
    super.setPosition(x, y);
    return this;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  override destroy(): void {
    super.destroy();
  }

  override update(): void {
    // Update character logic (if needed)
  }
}
