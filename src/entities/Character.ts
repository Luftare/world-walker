import { gameConfig } from "../config/gameConfig";
import { WeaponInventory } from "./weapons/WeaponInventory";
import { GameScene } from "../scenes/GameScene";
import { LivingAgent } from "./LivingAgent";

export class Character extends LivingAgent {
  private weaponInventory: WeaponInventory;
  private speed: number = gameConfig.playerSpeed;
  public moveTarget: Phaser.Math.Vector2;
  private toMoveTarget: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  constructor(scene: GameScene, x: number = 0, y: number = 0) {
    super(scene, x, y, gameConfig.playerRadius, 5, "character");

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

  override die(): void {
    super.die();

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
}
