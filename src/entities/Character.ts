import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";
import { WeaponInventory } from "./weapons/WeaponInventory";
import { GameLogicHelpers } from "../utils/gameLogicHelpers";

export class Character extends Phaser.Physics.Arcade.Sprite {
  public radius: number = gameConfig.playerRadius;

  // Movement properties
  private speed: number = gameConfig.movementSpeed;
  private finalTarget: Point | undefined;
  private isMovingTowardsTarget: boolean = false;
  private flockingEnabled: boolean = true;
  private avoidWeight: number = 2;
  private targetWeight: number = 1;

  // Pushback properties
  private pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private pushbackDecayRate: number = 0.85;

  // Follow properties
  private followTarget: Phaser.GameObjects.Sprite | undefined;
  private followDistance: number = 5;

  // Weapon properties
  private weaponInventory: WeaponInventory;

  // Health properties
  private health: number = 5;
  private maxHealth: number = 5;
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, "character");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(9);

    if (this.body) {
      // We use the sprite size for the physics body and later scale it to the correct size
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }

    this.setDisplaySize(this.radius * 2, this.radius * 2);

    // Initialize weapon inventory
    this.weaponInventory = new WeaponInventory();
  }

  override update(_time: number, delta: number): void {
    this.updateFollowBehavior();
    this.updateMovementBehavior(delta);
  }

  override setPosition(x: number, y: number): this {
    super.setPosition(x, y);
    return this;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // Movement methods
  setMovementTarget(x: number, y: number): void {
    this.target = { x, y };
    this.finalTarget = { x, y };
    this.isMovingTowardsTarget = true;
  }

  clearMovementTarget(): void {
    this.target = undefined;
    this.finalTarget = undefined;
    this.isMovingTowardsTarget = false;
  }

  applyPushback(direction: Phaser.Math.Vector2, strength: number): void {
    const pushbackVector = direction.clone().scale(strength);
    this.pushbackVelocity.add(pushbackVector);
  }

  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }

  // Follow methods
  setFollowTarget(targetEntity: Phaser.GameObjects.Sprite): void {
    this.followTarget = targetEntity;
  }

  getFollowTarget(): Phaser.GameObjects.Sprite | undefined {
    return this.followTarget;
  }

  setFollowDistance(distance: number): void {
    this.followDistance = distance;
  }

  // Weapon methods
  getWeaponInventory(): WeaponInventory {
    return this.weaponInventory;
  }

  canShoot(currentTime: number): boolean {
    return this.weaponInventory.canShoot(currentTime);
  }

  shoot(
    scene: Phaser.Scene,
    direction: { x: number; y: number },
    currentTime: number
  ): boolean {
    return this.weaponInventory.shoot(
      scene,
      this.x,
      this.y,
      direction,
      currentTime
    );
  }

  takeDamage(damage: number = 1): void {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - damage);
    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    if (this.isDead) return;

    this.isDead = true;

    // Disable movement and interactions
    this.isMovingTowardsTarget = false;
    this.target = undefined;
    this.finalTarget = undefined;

    // Create death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        // Emit player death event for scene handling
        this.scene.events.emit("playerDied");
      },
    });
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  // Private behavior methods
  private updateFollowBehavior(): void {
    if (!this.followTarget) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.followTarget.x,
      this.followTarget.y
    );

    if (distance > this.followDistance) {
      this.setMovementTarget(this.followTarget.x, this.followTarget.y);
    } else {
      this.clearMovementTarget();
    }
  }

  private calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

    // Get all entities in the scene that need to be avoided
    const entities = GameLogicHelpers.getAvoidableEntities(this.scene, this);

    for (const otherEntity of entities) {
      const distance = GameLogicHelpers.calculateDistance(
        this.x,
        this.y,
        otherEntity.x,
        otherEntity.y
      );
      const centerDistance = this.radius + otherEntity.radius;

      if (distance < centerDistance && distance > 0) {
        // Calculate vector pointing away from the other entity
        const awayVector = GameLogicHelpers.createAvoidanceVector(
          this.x,
          this.y,
          otherEntity.x,
          otherEntity.y
        );

        // Weight by distance (closer entities have stronger avoidance)
        const weight = GameLogicHelpers.calculateDistanceWeight(
          distance,
          centerDistance
        );
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
      this.finalTarget.x - this.x,
      this.finalTarget.y - this.y
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

  private updateMovementBehavior(delta: number): void {
    const deltaTime = delta / 1000;
    let newPosition = new Phaser.Math.Vector2(this.x, this.y);

    // Apply pushback regardless of movement state
    if (this.pushbackVelocity.length() > 0.001) {
      const pushbackOffset = this.pushbackVelocity.clone().scale(deltaTime);
      newPosition.add(pushbackOffset);
    }

    // Apply normal movement if moving towards target
    if (this.isMovingTowardsTarget && this.finalTarget) {
      if (this.flockingEnabled) {
        // Use flocking to calculate adjusted target
        const flockingDirection = this.calculateFlockingDirection();

        if (flockingDirection.length() > 0) {
          const moveDistance = this.speed * deltaTime;
          const movementOffset = flockingDirection.clone().scale(moveDistance);
          newPosition.add(movementOffset);

          // Update current target to the adjusted position for next frame
          this.target = { x: newPosition.x, y: newPosition.y };
        }
      } else {
        // Original movement logic without flocking
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.finalTarget.x,
          this.finalTarget.y
        );

        if (distance <= 0.1) {
          this.clearMovementTarget();
        } else {
          const moveDistance = this.speed * deltaTime;

          if (distance > 0) {
            const direction = new Phaser.Math.Vector2(
              this.finalTarget.x - this.x,
              this.finalTarget.y - this.y
            ).normalize();

            const movementOffset = direction.clone().scale(moveDistance);
            newPosition.add(movementOffset);

            const newDistance = Phaser.Math.Distance.Between(
              newPosition.x,
              newPosition.y,
              this.finalTarget.x,
              this.finalTarget.y
            );

            if (newDistance > distance) {
              newPosition.set(this.finalTarget.x, this.finalTarget.y);
            }
          }
        }
      }
    }

    // Update position
    this.setPosition(newPosition.x, newPosition.y);

    // Decay pushback velocity
    this.pushbackVelocity.scale(this.pushbackDecayRate);
  }
}
