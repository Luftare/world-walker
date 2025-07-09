import { Behavior } from "./Behavior";
import { Point } from "../types/types";
import { gameConfig } from "../config/gameConfig";

export class MovementBehavior extends Behavior {
  private speed: number = gameConfig.movementSpeed;
  private target: Point | undefined;
  private finalTarget: Point | undefined;
  private isMoving: boolean = false;
  private flockingEnabled: boolean = true;
  private avoidRadius: number = gameConfig.playerRadius * gameConfig.scale * 2;
  private avoidWeight: number = 2;
  private targetWeight: number = 1;

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getSpeed(): number {
    return this.speed;
  }

  setTarget(target: Point): void {
    this.target = target;
    this.finalTarget = target;
    this.isMoving = true;
  }

  setFinalTarget(finalTarget: Point): void {
    this.finalTarget = finalTarget;
    this.target = finalTarget;
    this.isMoving = true;
  }

  getTarget(): Point | undefined {
    return this.target;
  }

  getFinalTarget(): Point | undefined {
    return this.finalTarget;
  }

  clearTarget(): void {
    this.target = undefined;
    this.finalTarget = undefined;
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

  setTargetWeight(weight: number): void {
    this.targetWeight = weight;
  }

  private calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

    // Get all entities in the scene that need to be avoided
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
        // Calculate vector pointing away from the other entity
        const awayVector = new Phaser.Math.Vector2(
          this.entity.x - otherEntity.x,
          this.entity.y - otherEntity.y
        ).normalize();

        // Weight by distance (closer entities have stronger avoidance)
        const weight = (this.avoidRadius - distance) / this.avoidRadius;
        awayVector.scale(weight * this.avoidWeight);

        avoidanceVector.add(awayVector);
      }
    }

    return avoidanceVector;
  }

  private calculateFlockingDirection(): Phaser.Math.Vector2 {
    if (!this.finalTarget) {
      return new Phaser.Math.Vector2(0, 0);
    }

    const avoidanceVector = this.calculateAvoidanceVector();

    // Vector pointing towards the final target
    const targetVector = new Phaser.Math.Vector2(
      this.finalTarget.x - this.entity.x,
      this.finalTarget.y - this.entity.y
    )
      .normalize()
      .scale(this.targetWeight);

    // Combine avoidance and target vectors
    const combinedVector = avoidanceVector.add(targetVector);

    // Normalize the result
    if (combinedVector.length() > 0) {
      combinedVector.normalize();
    }

    return combinedVector;
  }

  update(_time: number, delta: number): void {
    if (!this.isMoving || !this.finalTarget) return;

    if (this.flockingEnabled) {
      // Use flocking to calculate adjusted target
      const flockingDirection = this.calculateFlockingDirection();

      if (flockingDirection.length() > 0) {
        const moveDistance = this.speed * gameConfig.scale * (delta / 1000);
        const newPosition = new Phaser.Math.Vector2(
          this.entity.x + flockingDirection.x * moveDistance,
          this.entity.y + flockingDirection.y * moveDistance
        );

        this.entity.setPosition(newPosition.x, newPosition.y);

        // Update current target to the adjusted position for next frame
        this.target = { x: newPosition.x, y: newPosition.y };
      }
    } else {
      // Original movement logic without flocking
      const distance = Phaser.Math.Distance.Between(
        this.entity.x,
        this.entity.y,
        this.finalTarget.x,
        this.finalTarget.y
      );

      if (distance <= 0.1) {
        this.clearTarget();
        return;
      }

      const moveDistance = this.speed * gameConfig.scale * (delta / 1000);

      if (distance > 0) {
        const direction = new Phaser.Math.Vector2(
          this.finalTarget.x - this.entity.x,
          this.finalTarget.y - this.entity.y
        ).normalize();

        const newPosition = new Phaser.Math.Vector2(
          this.entity.x + direction.x * moveDistance,
          this.entity.y + direction.y * moveDistance
        );

        const newDistance = Phaser.Math.Distance.Between(
          newPosition.x,
          newPosition.y,
          this.finalTarget.x,
          this.finalTarget.y
        );

        if (newDistance > distance) {
          this.entity.setPosition(this.finalTarget.x, this.finalTarget.y);
        } else {
          this.entity.setPosition(newPosition.x, newPosition.y);
        }
      }
    }
  }

  destroy(): void {
    this.clearTarget();
  }
}
