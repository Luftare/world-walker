import { GameLogicHelpers } from "../utils/gameLogicHelpers";
import { CircularGameObject } from "./CircularGameObject";

export class MovingAgent extends CircularGameObject {
  private awayVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private moveIntentVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private moveVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  // Pushback properties
  private pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private pushbackDecayRate: number = 0.85;

  applyPushback(impulse: Phaser.Math.Vector2): void {
    this.pushbackVelocity.add(impulse);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // Decay pushback velocity
    this.pushbackVelocity.scale(this.pushbackDecayRate);
  }

  public updateAvoidanceVector() {
    this.awayVector.set(0, 0);
    // Get all entities in the scene that need to be avoided
    const entities = GameLogicHelpers.getAvoidableEntities(this.scene, this);

    for (const otherEntity of entities) {
      const centerDistance = this.radius + otherEntity.radius;

      if (GameLogicHelpers.isWithinRange(this, otherEntity, centerDistance)) {
        // Calculate vector pointing away from the other entity
        const awayVector = GameLogicHelpers.createAvoidanceVector(
          this.x,
          this.y,
          otherEntity.x,
          otherEntity.y
        );

        this.awayVector.add(awayVector);
      }
    }
    this.awayVector.normalize();
  }

  public move(
    intendedDirection: Phaser.Math.Vector2,
    speed: number,
    delta: number
  ): void {
    const deltaSeconds = delta * 0.001;
    // Find avoidance vector
    this.updateAvoidanceVector();
    this.moveIntentVector
      .set(intendedDirection.x, intendedDirection.y)
      .normalize();
    this.moveVector.set(0, 0).add(this.awayVector).add(this.moveIntentVector);

    if (this.moveVector.x !== 0 && this.moveVector.y !== 0) {
      this.moveVector.normalize().scale(speed * deltaSeconds);
    }
    this.x += this.moveVector.x + this.pushbackVelocity.x * deltaSeconds;
    this.y += this.moveVector.y + this.pushbackVelocity.y * deltaSeconds;
  }
}
