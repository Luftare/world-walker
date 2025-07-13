import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";
import { GameLogicHelpers } from "../utils/gameLogicHelpers";
import { TweenHelpers } from "../utils/TweenHelpers";

export abstract class BaseEnemy extends Phaser.GameObjects.Container {
  // Core properties
  protected health: number;
  protected maxHealth: number;
  protected speed: number;
  protected isDead: boolean = false;

  // Movement properties
  protected target: Point | undefined;
  protected isMoving: boolean = false;
  protected directionDamp: number = 1;
  protected avoidRadius: number = gameConfig.playerRadius * 2;
  protected avoidWeight: number = 2;
  protected forwardWeight: number = 1;

  // Pushback properties
  protected pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    0,
    0
  );
  protected pushbackDecayRate: number = 0.85;

  // Follow properties
  protected targetEntity: Phaser.GameObjects.Sprite | undefined;
  protected followDistance: number = gameConfig.playerRadius * 2;
  protected aggroRange: number = 240;
  protected isAggroed: boolean = false;

  // Rotation properties
  protected targetRotation: number;
  protected angularVelocity: number = 0.4;

  // Attack properties
  protected lastAttackTime: number = 0;
  protected attackCooldown: number = 1500;
  protected attackRange: number = gameConfig.playerRadius * 2;
  protected isAttacking: boolean = false;

  // Visual properties
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private aggroRing!: Phaser.GameObjects.Graphics;
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    texture: string,
    health: number = 3,
    speed: number = gameConfig.enemySpeed
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health;
    this.maxHealth = health;
    this.speed = speed;

    this.setDepth(5);

    // Create the sprite as a child of the container
    this.sprite = scene.physics.add.sprite(0, 0, texture);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(5);
    this.add(this.sprite);

    // Set up physics body for the container
    if (this.body) {
      this.body.setSize(this.sprite.width, this.sprite.height);
      this.body.setCircle(this.sprite.width / 2);
    }

    const radius = gameConfig.playerRadius;
    this.sprite.setDisplaySize(radius * 2, radius * 2);
    this.sprite.rotation = Math.random() * 2 * Math.PI;

    this.targetRotation = this.spriteRotation;

    this.createAggroRing();

    TweenHelpers.spawnAnimation(scene, this, this.scaleX, this.scaleY);
  }

  private createAggroRing(): void {
    this.aggroRing = this.scene.add.graphics();
    this.aggroRing.setDepth(2);
    this.add(this.aggroRing);

    const enemyRadius = gameConfig.playerRadius;
    const ringRadius = enemyRadius * 2;
    const scaleRatio = ringRadius / enemyRadius;

    this.aggroRing.lineStyle(4, 0xff0000, 1);
    this.aggroRing.strokeCircle(0, 0, enemyRadius);
    this.aggroRing.setAlpha(0.5);

    this.scene.tweens.add({
      targets: this.aggroRing,
      scaleX: scaleRatio,
      scaleY: scaleRatio,
      alpha: 0,
      duration: 1500,
      ease: "Linear",
      repeat: -1,
      onRepeat: () => {
        this.aggroRing.setScale(1, 1);
        this.aggroRing.setAlpha(0.5);
      },
    });
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

  applyPushback(direction: Phaser.Math.Vector2, strength: number): void {
    const pushbackVector = direction.clone().scale(strength);
    this.pushbackVelocity.add(pushbackVector);
  }

  protected calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

    const entities = GameLogicHelpers.getAvoidableEntities(this.scene, this);

    for (const otherEntity of entities) {
      const distance = GameLogicHelpers.calculateDistance(
        this.x,
        this.y,
        otherEntity.x,
        otherEntity.y
      );

      if (distance < this.avoidRadius && distance > 0) {
        const awayVector = GameLogicHelpers.createAvoidanceVector(
          this.x,
          this.y,
          otherEntity.x,
          otherEntity.y
        );

        const weight = GameLogicHelpers.calculateDistanceWeight(
          distance,
          this.avoidRadius
        );
        awayVector.scale(weight * this.avoidWeight);

        avoidanceVector.add(awayVector);
      }
    }

    return avoidanceVector;
  }

  protected calculateForwardVector(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.cos(this.spriteRotation),
      Math.sin(this.spriteRotation)
    ).scale(this.forwardWeight);
  }

  protected calculateDirectionDampFactor(): number {
    if (this.directionDamp === 0 || !this.target) {
      return 1;
    }

    const forwardVector = new Phaser.Math.Vector2(
      Math.cos(this.spriteRotation),
      Math.sin(this.spriteRotation)
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

  protected calculateMovementDirection(): Phaser.Math.Vector2 {
    const forwardVector = this.calculateForwardVector();
    const avoidanceVector = this.calculateAvoidanceVector();

    const combinedVector = forwardVector.add(avoidanceVector);

    if (combinedVector.length() > 0) {
      combinedVector.normalize();
    }

    return combinedVector;
  }

  protected updateMovement(delta: number): void {
    const deltaTime = delta / 1000;
    let newPosition = new Phaser.Math.Vector2(this.x, this.y);

    // Apply pushback regardless of movement state
    if (this.pushbackVelocity.length() > 0) {
      const pushbackOffset = this.pushbackVelocity.clone().scale(deltaTime);
      newPosition.add(pushbackOffset);
    }

    // Apply normal movement if moving
    if (this.isMoving) {
      const movementDirection = this.calculateMovementDirection();

      if (movementDirection.length() > 0) {
        const dampFactor = this.calculateDirectionDampFactor();
        const moveDistance = this.speed * deltaTime * dampFactor;
        const movementOffset = movementDirection.clone().scale(moveDistance);
        newPosition.add(movementOffset);
      }
    }

    // Update position
    this.setPosition(newPosition.x, newPosition.y);

    // Update target if moving
    if (this.isMoving) {
      this.target = { x: newPosition.x, y: newPosition.y };
    }

    // Decay pushback velocity
    this.pushbackVelocity.scale(this.pushbackDecayRate);

    if (this.pushbackVelocity.length() < 1) {
      this.pushbackVelocity.set(0, 0);
    }
  }

  protected updateFollow(): void {
    if (!this.targetEntity) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetEntity.x,
      this.targetEntity.y
    );

    // Check if player is within aggro range
    if (!this.isAggroed && distance <= this.aggroRange) {
      this.isAggroed = true;
    }

    // Only follow if aggroed
    if (this.isAggroed) {
      if (distance > this.followDistance) {
        this.target = { x: this.targetEntity.x, y: this.targetEntity.y };
        this.isMoving = true;
      } else {
        this.target = undefined;
        this.isMoving = false;
      }
    } else {
      this.target = undefined;
      this.isMoving = false;
    }
  }

  protected updateRotation(delta: number): void {
    // Only rotate towards target if aggroed
    if (this.target && this.isAggroed) {
      this.targetRotation = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
    }

    const deltaTime = delta / 1000;
    const lerpFactor = this.angularVelocity * deltaTime;
    const currentRotation = this.spriteRotation;

    let angleDiff = this.targetRotation - currentRotation;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    const newRotation = currentRotation + angleDiff * lerpFactor;
    this.spriteRotation = newRotation;
  }

  protected updateAttack(): void {
    if (!this.targetEntity || this.isDead || !this.isAggroed) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetEntity.x,
      this.targetEntity.y
    );

    const currentTime = this.scene.time.now;

    if (
      distance <= this.attackRange &&
      currentTime - this.lastAttackTime >= this.attackCooldown
    ) {
      this.performAttack();
    }
  }

  protected abstract performAttack(): void;

  isInAttackRange(): boolean {
    if (!this.targetEntity || !this.isAggroed) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetEntity.x,
      this.targetEntity.y
    );

    return distance <= this.attackRange;
  }

  die(): void {
    if (this.isDead) return;

    this.isDead = true;

    if (this.body) {
      this.body.enable = false;
    }
    this.targetEntity = undefined;
    this.target = undefined;

    // Emit zombie death event with the zombie instance
    this.scene.events.emit("zombieDied", this.x, this.y, this);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.001,
      duration: 500,
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
    const willDie = this.health <= 0;

    // Aggro the enemy when it takes damage
    this.isAggroed = true;

    this.createStainEffect(willDie ? 12 : 5, projectileDirection);

    if (willDie) {
      this.die();
    }
  }

  protected createStainEffect(
    amount: number,
    projectileDirection?: Phaser.Math.Vector2
  ): void {
    for (let i = 0; i < amount; i++) {
      this.createStain(projectileDirection);
    }
  }

  protected createStain(projectileDirection?: Phaser.Math.Vector2): void {
    const stainX = this.x;
    const stainY = this.y;

    const baseRadius = gameConfig.playerRadius * 0.3;
    const stain = this.scene.add.circle(stainX, stainY, baseRadius, 0x006400);
    stain.setDepth(2);

    let baseAngle: number;
    if (projectileDirection) {
      baseAngle = Math.atan2(projectileDirection.y, projectileDirection.x);
    } else {
      baseAngle = this.spriteRotation + Math.PI;
    }

    const fanSpread = Math.PI / 3;
    const randomAngle = baseAngle + (Math.random() - 0.5) * fanSpread;

    const distance = 30 + Math.random() * 60;
    const scale = 0.3 + Math.random() * 0.7;

    stain.setScale(scale);

    const targetX = stainX + Math.cos(randomAngle) * distance;
    const targetY = stainY + Math.sin(randomAngle) * distance;

    this.scene.tweens.add({
      targets: stain,
      x: targetX,
      y: targetY,
      duration: 200 + Math.random() * 100,
      ease: "Power2",
      onComplete: () => {
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

  getIsAggroed(): boolean {
    return this.isAggroed;
  }

  isFacingTarget(): boolean {
    if (!this.targetEntity) return false;
    const toleranceDegrees = 60;

    const targetAngle = Math.atan2(
      this.targetEntity.y - this.y,
      this.targetEntity.x - this.x
    );

    let angleDiff = Math.abs(targetAngle - this.spriteRotation);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    const toleranceRadians = (toleranceDegrees * Math.PI) / 180;
    return angleDiff <= toleranceRadians;
  }

  resetAggro(): void {
    this.isAggroed = false;
  }

  // Expose sprite rotation for compatibility
  get spriteRotation(): number {
    return this.sprite.rotation;
  }

  set spriteRotation(value: number) {
    this.sprite.rotation = value;
  }

  override update(_time: number, delta: number): void {
    this.updateFollow();
    this.updateRotation(delta);
    this.updateMovement(delta);
    this.aggroRing.visible = this.isAggroed && !this.isDead;
    if (this.isDead) return;
    this.updateAttack();
  }
}
