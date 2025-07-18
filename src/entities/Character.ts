import { gameConfig } from "../config/gameConfig";
import { WeaponInventory } from "./weapons/WeaponInventory";
import { GameScene } from "../scenes/GameScene";
import { MovingAgent } from "./MovingAgent";

export class Character extends MovingAgent {
  private weaponInventory: WeaponInventory;
  private health: number = 5;
  private maxHealth: number = 5;
  private isDead: boolean = false;
  private speed: number = gameConfig.playerSpeed;
  public moveTarget: Phaser.Math.Vector2;
  private toMoveTarget: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  constructor(scene: GameScene, x: number = 0, y: number = 0) {
    super(scene, x, y, gameConfig.playerRadius, "character");

    this.moveTarget = new Phaser.Math.Vector2(x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;

    // Initialize weapon inventory
    this.weaponInventory = new WeaponInventory();
  }

  override update(time: number, delta: number) {
    super.update(time, delta);
    this.moveTowardsMoveTarget(delta);
  }

  private moveTowardsMoveTarget(delta: number) {
    this.toMoveTarget.set(this.moveTarget.x, this.moveTarget.y).subtract(this);
    this.move(this.toMoveTarget, this.speed, delta);
  }

  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }

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

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
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
}
