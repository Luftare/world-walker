import { gameConfig } from "../config/gameConfig";
import { Point } from "../types/types";
import { WeaponInventory } from "./weapons/WeaponInventory";
import { GameLogicHelpers } from "../utils/gameLogicHelpers";
import { GameScene } from "../scenes/GameScene";

export class Character extends Phaser.Physics.Arcade.Sprite {
  public radius: number = gameConfig.playerRadius;

  // Movement properties
  private speed: number = gameConfig.movementSpeed;
  private finalTarget: Point | undefined;
  private avoidWeight: number = 2;
  private targetWeight: number = 1;

  // Pushback properties
  private pushbackVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private pushbackDecayRate: number = 0.85;

  private followTarget: Phaser.GameObjects.Sprite | undefined;

  // Weapon properties
  private weaponInventory: WeaponInventory;

  // Health properties
  private health: number = 5;
  private maxHealth: number = 5;
  private isDead: boolean = false;
  override scene: GameScene;

  constructor(scene: GameScene, x: number = 0, y: number = 0) {
    super(scene, x, y, "character");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
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

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // Movement methods
  setMovementTarget(x: number, y: number): void {
    this.finalTarget = { x, y };
  }

  applyPushback(impulse: Phaser.Math.Vector2): void {
    this.pushbackVelocity.add(impulse);
  }

  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
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

    this.setMovementTarget(this.followTarget.x, this.followTarget.y);
  }

  private calculateAvoidanceVector(): Phaser.Math.Vector2 {
    const avoidanceVector = new Phaser.Math.Vector2(0, 0);

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

        awayVector.scale(this.avoidWeight);

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
    if (this.finalTarget) {
      // Use flocking to calculate adjusted target
      const flockingDirection = this.calculateFlockingDirection();

      if (flockingDirection.length() > 0) {
        const moveDistance = this.speed * deltaTime;
        const movementOffset = flockingDirection.clone().scale(moveDistance);
        newPosition.add(movementOffset);

        // Update current target to the adjusted position for next frame
      }
    }

    // Update position
    this.setPosition(newPosition.x, newPosition.y);

    // Decay pushback velocity
    this.pushbackVelocity.scale(this.pushbackDecayRate);
  }
}
