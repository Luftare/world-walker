import { Behavior } from "./Behavior";
import { Point } from "../types/types";
import { gameConfig } from "../config/gameConfig";
import { IMovementBehavior } from "./IMovementBehavior";

export class DirectionalMovementBehavior
  extends Behavior
  implements IMovementBehavior
{
  private speed: number = gameConfig.movementSpeed;
  private target: Point | undefined;
  private isMoving: boolean = false;
  private flockingEnabled: boolean = true;
  private avoidRadius: number = gameConfig.playerRadius * gameConfig.scale * 2;
  private avoidWeight: number = 2;
  private forwardWeight: number = 1;

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getSpeed(): number {
    return this.speed;
  }

  setTarget(target: Point): void {
    this.target = target;
    this.isMoving = true;
  }

  setFinalTarget(finalTarget: Point): void {
    this.target = finalTarget;
    this.isMoving = true;
  }

  getTarget(): Point | undefined {
    return this.target;
  }

  getFinalTarget(): Point | undefined {
    return this.target;
  }

  clearTarget(): void {
    this.target = undefined;
    this.isMoving = false;
  }

  isMovingTowardsTarget(): boolean {
    return this.isMoving && this.target !== undefined;
  }

  setFlockingEnabled(enabled: boolean): void {
    this.flockingEnabled = enabled;
  }

  setAvoidRadius(radius: number): void {
    this.avoidRadius = radius;
  }

  setAvoidWeight(weight: number): void {
    this.avoidWeight = weight;
  }

  setForwardWeight(weight: number): void {
    this.forwardWeight = weight;
  }

  setTargetWeight(weight: number): void {
    // This method is kept for compatibility but not used in directional movement
  }

  private calculateFlockingDirection(): Phaser.Math.Vector2 {
    // This method is kept for compatibility but delegates to calculateMovementDirection
    return this.calculateMovementDirection();
  }

  private calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

    const entities = this.entity.scene.children.list.filter(
      (child) =>
        child instanceof Phaser.Physics.Arcade.Sprite &&
        child !== this.entity &&
        child.active
    ) as Phaser.Physics.Arcade.Sprite[];

    for (const otherEntity of entities) {
      const distance = Phaser.Math.Distance.Between(
        this.entity.x,
        this.entity.y,
        otherEntity.x,
        otherEntity.y
      );

      if (distance < this.avoidRadius && distance > 0) {
        const awayVector = new Phaser.Math.Vector2(
          this.entity.x - otherEntity.x,
          this.entity.y - otherEntity.y
        ).normalize();

        const weight = (this.avoidRadius - distance) / this.avoidRadius;
        awayVector.scale(weight * this.avoidWeight);

        avoidanceVector.add(awayVector);
      }
    }

    return avoidanceVector;
  }

  private calculateForwardVector(): Phaser.Math.Vector2 {
    // Calculate forward vector based on entity's current rotation
    return new Phaser.Math.Vector2(
      Math.cos(this.entity.rotation),
      Math.sin(this.entity.rotation)
    ).scale(this.forwardWeight);
  }

  private calculateMovementDirection(): Phaser.Math.Vector2 {
    const forwardVector = this.calculateForwardVector();

    if (!this.flockingEnabled) {
      return forwardVector.normalize();
    }

    const avoidanceVector = this.calculateAvoidanceVector();

    // Combine forward and avoidance vectors
    const combinedVector = forwardVector.add(avoidanceVector);

    // Normalize the result
    if (combinedVector.length() > 0) {
      combinedVector.normalize();
    }

    return combinedVector;
  }

  update(_time: number, delta: number): void {
    if (!this.isMoving) return;

    const movementDirection = this.calculateMovementDirection();

    if (movementDirection.length() > 0) {
      const moveDistance = this.speed * gameConfig.scale * (delta / 1000);
      const newPosition = new Phaser.Math.Vector2(
        this.entity.x + movementDirection.x * moveDistance,
        this.entity.y + movementDirection.y * moveDistance
      );

      this.entity.setPosition(newPosition.x, newPosition.y);

      // Update current target to the new position for next frame
      this.target = { x: newPosition.x, y: newPosition.y };
    }
  }

  destroy(): void {
    this.clearTarget();
  }
}
