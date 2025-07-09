import { Behavior } from "./Behavior";
import { MovementBehavior } from "./MovementBehavior";

export class FollowBehavior extends Behavior {
  private targetEntity: Phaser.GameObjects.Sprite | undefined;
  private followDistance: number = 5;
  private movementBehavior: MovementBehavior;

  constructor(
    entity: Phaser.GameObjects.Sprite,
    movementBehavior: MovementBehavior
  ) {
    super(entity);
    this.movementBehavior = movementBehavior;
  }

  setTarget(targetEntity: Phaser.GameObjects.Sprite): void {
    this.targetEntity = targetEntity;
  }

  getTarget(): Phaser.GameObjects.Sprite | undefined {
    return this.targetEntity;
  }

  setFollowDistance(distance: number): void {
    this.followDistance = distance;
  }

  getFollowDistance(): number {
    return this.followDistance;
  }

  update(_time: number, _delta: number): void {
    if (!this.targetEntity) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      this.targetEntity.x,
      this.targetEntity.y
    );

    if (distance > this.followDistance) {
      this.movementBehavior.setFinalTarget({
        x: this.targetEntity.x,
        y: this.targetEntity.y,
      });
    } else {
      this.movementBehavior.clearTarget();
    }
  }

  destroy(): void {
    this.targetEntity = undefined;
    this.movementBehavior.clearTarget();
  }
}
