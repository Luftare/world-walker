import { Behavior } from "./Behavior";
import { IMovementBehavior } from "./IMovementBehavior";

export class RotationBehavior extends Behavior {
  private lastPosition: { x: number; y: number };
  private targetRotation: number;
  private angularVelocity: number;
  private movementBehavior: IMovementBehavior | undefined;

  constructor(
    entity: Phaser.GameObjects.Sprite,
    angularVelocity: number = 0.5,
    movementBehavior?: IMovementBehavior
  ) {
    super(entity);
    this.lastPosition = { x: entity.x, y: entity.y };
    this.targetRotation = entity.rotation;
    this.angularVelocity = angularVelocity;
    this.movementBehavior = movementBehavior;
  }

  update(_time: number, delta: number): void {
    const currentPosition = { x: this.entity.x, y: this.entity.y };

    // If we have a movement behavior with a target, rotate towards it
    if (this.movementBehavior && this.movementBehavior.getFinalTarget()) {
      const target = this.movementBehavior.getFinalTarget()!;
      this.targetRotation = Math.atan2(
        target.y - this.entity.y,
        target.x - this.entity.x
      );
    } else {
      // Fallback to movement-based rotation
      const deltaX = currentPosition.x - this.lastPosition.x;
      const deltaY = currentPosition.y - this.lastPosition.y;

      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        // Entity is moving, calculate target rotation
        this.targetRotation = Math.atan2(deltaY, deltaX);
      }
    }

    // Lerp towards target rotation
    const deltaTime = delta / 1000; // Convert to seconds
    const lerpFactor = this.angularVelocity * deltaTime;
    const currentRotation = this.entity.rotation;

    // Handle angle wrapping for smooth rotation
    let angleDiff = this.targetRotation - currentRotation;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    const newRotation = currentRotation + angleDiff * lerpFactor;
    this.entity.setRotation(newRotation);

    // Update last position
    this.lastPosition = currentPosition;
  }

  destroy(): void {
    // No cleanup needed
  }
}
