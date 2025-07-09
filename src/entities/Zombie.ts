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

  // Pushback properties
  private pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private pushbackDecayRate: number = 0.95; // How quickly pushback velocity decays

  // Follow properties
  private targetEntity: Phaser.GameObjects.Sprite | undefined;
  private followDistance: number = gameConfig.playerRadius * 2;

  // Rotation properties
  private targetRotation: number;
  private angularVelocity: number = 0.2;

  // Health properties
  private health: number = 3;
  private maxHealth: number = 3;

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

  applyPushback(direction: Phaser.Math.Vector2, strength: number = 100): void {
    if (this.isDead) return;

    // Add pushback velocity in the direction of the projectile
    const pushbackVector = direction.clone().scale(strength);
    this.pushbackVelocity.add(pushbackVector);
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

      // Apply pushback velocity
      const deltaTime = delta / 1000;
      const pushbackOffset = this.pushbackVelocity.clone().scale(deltaTime);
      newPosition.add(pushbackOffset);

      this.setPosition(newPosition.x, newPosition.y);

      this.target = { x: newPosition.x, y: newPosition.y };
    }

    // Decay pushback velocity
    this.pushbackVelocity.scale(this.pushbackDecayRate);

    // Stop pushback if it becomes very small
    if (this.pushbackVelocity.length() < 1) {
      this.pushbackVelocity.set(0, 0);
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

  takeDamage(
    damage: number = 1,
    projectileDirection?: Phaser.Math.Vector2
  ): void {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - damage);

    // Create stain effect
    this.createStainEffect(projectileDirection);

    if (this.health <= 0) {
      this.die();
    }
  }

  private createStainEffect(projectileDirection?: Phaser.Math.Vector2): void {
    // Create 5 stains that fly in the direction of the projectile
    for (let i = 0; i < 5; i++) {
      this.createStain(projectileDirection);
    }
  }

  private createStain(projectileDirection?: Phaser.Math.Vector2): void {
    // Calculate position at the zombie's center
    const stainX = this.x;
    const stainY = this.y;

    const baseRadius = gameConfig.playerRadius * gameConfig.scale * 0.3;
    // Create stain as a simple dark green circle
    const stain = this.scene.add.circle(stainX, stainY, baseRadius, 0x006400); // Dark green circle with radius 8
    stain.setDepth(4);

    // Use projectile direction if available, otherwise use zombie's facing direction
    let baseAngle: number;
    if (projectileDirection) {
      baseAngle = Math.atan2(projectileDirection.y, projectileDirection.x);
    } else {
      baseAngle = this.rotation + Math.PI; // Behind the zombie as fallback
    }

    const fanSpread = Math.PI / 3; // 60 degree spread
    const randomAngle = baseAngle + (Math.random() - 0.5) * fanSpread;

    // Random distance and scale (0.2x of original sizes)
    const distance = (3 + Math.random() * 6) * gameConfig.scale;
    const scale = 0.3 + Math.random() * 0.7;

    stain.setScale(scale);

    // Calculate target position
    const targetX = stainX + Math.cos(randomAngle) * distance;
    const targetY = stainY + Math.sin(randomAngle) * distance;

    // First animation: fast movement to target position
    this.scene.tweens.add({
      targets: stain,
      x: targetX,
      y: targetY,
      duration: 200 + Math.random() * 100, // 200-300ms (fast initial movement)
      ease: "Power2",
      onComplete: () => {
        // Second animation: slow scaling and fading after stopping
        this.scene.tweens.add({
          targets: stain,
          alpha: 0,
          scaleX: scale * 5,
          scaleY: scale * 5,
          duration: (10000 + Math.random() * 10000) * 5,
          ease: "Power2",
          onComplete: () => {
            stain.destroy();
          },
        });
      },
    });
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  override update(_: number, delta: number): void {
    if (this.isDead) return;

    this.updateFollow();
    this.updateRotation(delta);
    this.updateMovement(delta);
  }
}
