import { gameConfig } from "../config/gameConfig";
import { BehaviorManager } from "../behaviors/BehaviorManager";
import { MovementBehavior } from "../behaviors/MovementBehavior";
import { FollowBehavior } from "../behaviors/FollowBehavior";
import { RotationBehavior } from "../behaviors/RotationBehavior";

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  private behaviorManager: BehaviorManager;

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    texture: string = "zombie"
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(5);

    if (this.body) {
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }

    const radius = gameConfig.playerRadius * gameConfig.scale * 0.8; // Slightly smaller than player
    this.setDisplaySize(radius * 2, radius * 2);

    // Initialize behavior manager
    this.behaviorManager = new BehaviorManager();

    // Add movement behavior
    const movementBehavior = new MovementBehavior(this);
    movementBehavior.setSpeed(gameConfig.movementSpeed * 0.7); // Zombies move slower
    this.behaviorManager.addBehavior("movement", movementBehavior);

    // Add follow behavior
    const followBehavior = new FollowBehavior(this, movementBehavior);
    followBehavior.setFollowDistance(gameConfig.playerRadius * 2); // Follow distance in meters
    this.behaviorManager.addBehavior("follow", followBehavior);

    // Add rotation behavior
    const rotationBehavior = new RotationBehavior(this);
    this.behaviorManager.addBehavior("rotation", rotationBehavior);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getBehaviorManager(): BehaviorManager {
    return this.behaviorManager;
  }

  getMovementBehavior(): MovementBehavior | undefined {
    return this.behaviorManager.getBehavior<MovementBehavior>("movement");
  }

  getFollowBehavior(): FollowBehavior | undefined {
    return this.behaviorManager.getBehavior<FollowBehavior>("follow");
  }

  setTarget(target: Phaser.GameObjects.Sprite): void {
    const followBehavior = this.getFollowBehavior();
    if (followBehavior) {
      followBehavior.setTarget(target);
    }
  }

  setSpeed(speed: number): void {
    const movementBehavior = this.getMovementBehavior();
    if (movementBehavior) {
      movementBehavior.setSpeed(speed);
    }
  }

  setFollowDistance(distance: number): void {
    const followBehavior = this.getFollowBehavior();
    if (followBehavior) {
      followBehavior.setFollowDistance(distance);
    }
  }

  override destroy(): void {
    this.behaviorManager.destroy();
    super.destroy();
  }

  override update(time: number, delta: number): void {
    this.behaviorManager.update(time, delta);
  }
}
