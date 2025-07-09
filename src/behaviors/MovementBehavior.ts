import { Behavior } from "./Behavior";
import { Point } from "../types/types";
import { gameConfig } from "../config/gameConfig";

export class MovementBehavior extends Behavior {
  private speed: number = gameConfig.movementSpeed;
  private target: Point | undefined;
  private isMoving: boolean = false;

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

  getTarget(): Point | undefined {
    return this.target;
  }

  clearTarget(): void {
    this.target = undefined;
    this.isMoving = false;
  }

  isMovingTowardsTarget(): boolean {
    return this.isMoving && this.target !== undefined;
  }

  update(_time: number, delta: number): void {
    if (!this.isMoving || !this.target) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      this.target.x,
      this.target.y
    );

    if (distance <= 0.1) {
      this.clearTarget();
      return;
    }

    const moveDistance = this.speed * gameConfig.scale * (delta / 1000);

    if (distance > 0) {
      const direction = new Phaser.Math.Vector2(
        this.target.x - this.entity.x,
        this.target.y - this.entity.y
      ).normalize();

      const newPosition = new Phaser.Math.Vector2(
        this.entity.x + direction.x * moveDistance,
        this.entity.y + direction.y * moveDistance
      );

      const newDistance = Phaser.Math.Distance.Between(
        newPosition.x,
        newPosition.y,
        this.target.x,
        this.target.y
      );

      if (newDistance > distance) {
        this.entity.setPosition(this.target.x, this.target.y);
        // this.clearTarget();
      } else {
        this.entity.setPosition(newPosition.x, newPosition.y);
      }
    }
  }

  destroy(): void {
    this.clearTarget();
  }
}
