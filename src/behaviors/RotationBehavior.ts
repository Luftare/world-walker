import { Behavior } from "./Behavior";

export class RotationBehavior extends Behavior {
  private lastPosition: { x: number; y: number };

  constructor(entity: Phaser.GameObjects.Sprite) {
    super(entity);
    this.lastPosition = { x: entity.x, y: entity.y };
  }

  update(_time: number, _delta: number): void {
    const currentPosition = { x: this.entity.x, y: this.entity.y };

    // Check if entity has moved
    const deltaX = currentPosition.x - this.lastPosition.x;
    const deltaY = currentPosition.y - this.lastPosition.y;

    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
      // Entity is moving, calculate rotation
      const angle = Math.atan2(deltaY, deltaX);
      this.entity.setRotation(angle);
    }

    // Update last position
    this.lastPosition = currentPosition;
  }

  destroy(): void {
    // No cleanup needed
  }
}
