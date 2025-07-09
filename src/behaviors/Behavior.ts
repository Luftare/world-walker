export abstract class Behavior {
  protected entity: Phaser.GameObjects.Sprite;

  constructor(entity: Phaser.GameObjects.Sprite) {
    this.entity = entity;
  }

  abstract update(time: number, delta: number): void;
  abstract destroy(): void;
}
