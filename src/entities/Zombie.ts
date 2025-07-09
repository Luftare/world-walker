import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  // Movement properties
  private speed: number = gameConfig.movementSpeed * 0.25; // Zombies move slower
  private target: Point | undefined;
  private isMoving: boolean = false;
  private directionDamp: number = 1; // Enable direction dampening
  private avoidRadius: number = gameConfig.playerRadius * gameConfig.scale * 2;
  private avoidWeight: number = 2;
  private forwardWeight: number = 1;

  // Follow properties
  private targetEntity: Phaser.GameObjects.Sprite | undefined;
  private followDistance: number = gameConfig.playerRadius * 2;

  // Rotation properties
  private targetRotation: number;
  private angularVelocity: number = 0.2;

  // Death properties
  private isDead: boolean = false;

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

    const radius = gameConfig.playerRadius * gameConfig.scale;
    this.setDisplaySize(radius * 2, radius * 2);

    // Initialize rotation properties
    this.targetRotation = this.rotation;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setTarget(target: Phaser.GameObjects.Sprite): void {
    this.targetEntity = target;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setFollowDistance(distance: number): void {
    this.followDistance = distance;
  }

  private calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

    const entities = this.scene.children.list.filter(
      (child) =>
        child instanceof Phaser.Physics.Arcade.Sprite &&
        child !== this &&
        child.active
    ) as Phaser.Physics.Arcade.Sprite[];

    for (const otherEntity of entities) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        otherEntity.x,
        otherEntity.y
      );

      if (distance < this.avoidRadius && distance > 0) {
        const awayVector = new Phaser.Math.Vector2(
          this.x - otherEntity.x,
          this.y - otherEntity.y
        ).normalize();

        const weight = (this.avoidRadius - distance) / this.avoidRadius;
        awayVector.scale(weight * this.avoidWeight);

        avoidanceVector.add(awayVector);
      }
    }

    return avoidanceVector;
  }

  private calculateForwardVector(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    ).scale(this.forwardWeight);
  }

  private calculateDirectionDampFactor(): number {
    if (this.directionDamp === 0 || !this.target) {
      return 1;
    }

    const forwardVector = new Phaser.Math.Vector2(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );

    const targetVector = new Phaser.Math.Vector2(
      this.target.x - this.x,
      this.target.y - this.y
    ).normalize();

    const dotProduct = forwardVector.dot(targetVector);
    const dampFactor = 1 - (this.directionDamp * (1 - dotProduct)) / 2;
    const weightedDampFactor = dampFactor ** 4;

    return Math.max(0, weightedDampFactor);
  }

  private calculateMovementDirection(): Phaser.Math.Vector2 {
    const forwardVector = this.calculateForwardVector();
    const avoidanceVector = this.calculateAvoidanceVector();

    const combinedVector = forwardVector.add(avoidanceVector);

    if (combinedVector.length() > 0) {
      combinedVector.normalize();
    }

    return combinedVector;
  }

  private updateMovement(delta: number): void {
    if (!this.isMoving) return;

    const movementDirection = this.calculateMovementDirection();

    if (movementDirection.length() > 0) {
      const dampFactor = this.calculateDirectionDampFactor();
      const moveDistance =
        this.speed * gameConfig.scale * (delta / 1000) * dampFactor;
      const newPosition = new Phaser.Math.Vector2(
        this.x + movementDirection.x * moveDistance,
        this.y + movementDirection.y * moveDistance
      );

      this.setPosition(newPosition.x, newPosition.y);

      this.target = { x: newPosition.x, y: newPosition.y };
    }
  }

  private updateFollow(): void {
    if (!this.targetEntity) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetEntity.x,
      this.targetEntity.y
    );

    if (distance > this.followDistance) {
      this.target = { x: this.targetEntity.x, y: this.targetEntity.y };
      this.isMoving = true;
    } else {
      this.target = undefined;
      this.isMoving = false;
    }
  }

  private updateRotation(delta: number): void {
    // Calculate rotation based on target direction or movement direction
    if (this.target) {
      // Rotate towards target
      this.targetRotation = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
    }

    const deltaTime = delta / 1000;
    const lerpFactor = this.angularVelocity * deltaTime;
    const currentRotation = this.rotation;

    let angleDiff = this.targetRotation - currentRotation;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    const newRotation = currentRotation + angleDiff * lerpFactor;
    this.setRotation(newRotation);
  }

  die(): void {
    if (this.isDead) return;

    this.isDead = true;

    // Disable physics and movement
    if (this.body) {
      this.body.enable = false;
    }
    this.isMoving = false;
    this.targetEntity = undefined;
    this.target = undefined;

    // Create death animation tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 0.001,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
      },
    });
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  override update(_: number, delta: number): void {
    if (this.isDead) return;

    this.updateFollow();
    this.updateRotation(delta);
    this.updateMovement(delta);
  }
}
