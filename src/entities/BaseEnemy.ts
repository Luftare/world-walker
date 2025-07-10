import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";

export abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  // Core properties
  protected health: number;
  protected maxHealth: number;
  protected speed: number;
  protected isDead: boolean = false;

  // Movement properties
  protected target: Point | undefined;
  protected isMoving: boolean = false;
  protected directionDamp: number = 1;
  protected avoidRadius: number =
    gameConfig.playerRadius * gameConfig.scale * 2;
  protected avoidWeight: number = 2;
  protected forwardWeight: number = 1;

  // Pushback properties
  protected pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    0,
    0
  );
  protected pushbackDecayRate: number = 0.9;

  // Follow properties
  protected targetEntity: Phaser.GameObjects.Sprite | undefined;
  protected followDistance: number = gameConfig.playerRadius * 2;

  // Rotation properties
  protected targetRotation: number;
  protected angularVelocity: number = 0.4;

  // Attack properties
  protected lastAttackTime: number = 0;
  protected attackCooldown: number = 1000;
  protected attackRange: number =
    gameConfig.playerRadius * gameConfig.scale * 2;
  protected isAttacking: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    texture: string,
    health: number = 3,
    speed: number = gameConfig.movementSpeed * 0.4
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = health;
    this.maxHealth = health;
    this.speed = speed;

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(5);

    if (this.body) {
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }

    const radius = gameConfig.playerRadius * gameConfig.scale;
    this.setDisplaySize(radius * 2, radius * 2);

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

  applyPushback(direction: Phaser.Math.Vector2, strength: number = 30): void {
    const pushbackVector = direction.clone().scale(strength);
    this.pushbackVelocity.add(pushbackVector);
  }

  protected calculateAvoidanceVector(): Phaser.Math.Vector2 {
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

  protected calculateForwardVector(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    ).scale(this.forwardWeight);
  }

  protected calculateDirectionDampFactor(): number {
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

      const deltaTime = delta / 1000;
      const pushbackOffset = this.pushbackVelocity.clone().scale(deltaTime);
      newPosition.add(pushbackOffset);

      this.setPosition(newPosition.x, newPosition.y);

      this.target = { x: newPosition.x, y: newPosition.y };
    }

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

    if (distance > this.followDistance) {
      this.target = { x: this.targetEntity.x, y: this.targetEntity.y };
      this.isMoving = true;
    } else {
      this.target = undefined;
      this.isMoving = false;
    }
  }

  protected updateRotation(delta: number): void {
    if (this.target) {
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

  protected updateAttack(): void {
    if (!this.targetEntity || this.isDead) return;

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
    if (!this.targetEntity) return false;

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
    this.isMoving = false;
    this.targetEntity = undefined;
    this.target = undefined;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
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

    const baseRadius = gameConfig.playerRadius * gameConfig.scale * 0.3;
    const stain = this.scene.add.circle(stainX, stainY, baseRadius, 0x006400);
    stain.setDepth(4);

    let baseAngle: number;
    if (projectileDirection) {
      baseAngle = Math.atan2(projectileDirection.y, projectileDirection.x);
    } else {
      baseAngle = this.rotation + Math.PI;
    }

    const fanSpread = Math.PI / 3;
    const randomAngle = baseAngle + (Math.random() - 0.5) * fanSpread;

    const distance = (3 + Math.random() * 6) * gameConfig.scale;
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

  override update(_time: number, delta: number): void {
    if (this.isDead) return;

    this.updateFollow();
    this.updateRotation(delta);
    this.updateMovement(delta);
    this.updateAttack();
  }
}
