import { gameConfig } from "../config/gameConfig";
import { TweenHelpers } from "../utils/TweenHelpers";

export abstract class PickableItem extends Phaser.GameObjects.Container {
  protected pickupRadius: number = gameConfig.playerRadius * 4;
  protected isPickedUp: boolean = false;
  protected tweenDuration: number = 500;
  private pickupRing!: Phaser.GameObjects.Graphics;
  private sprite!: Phaser.Physics.Arcade.Sprite;
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(3);

    // Create the sprite as a child of the container
    this.sprite = scene.physics.add.sprite(0, 0, texture);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(3);
    this.add(this.sprite);

    // Set up physics body for the container
    if (this.body) {
      this.body.setSize(this.sprite.width, this.sprite.height);
      this.body.setCircle(this.sprite.width / 2);
    }

    const radius = gameConfig.playerRadius;
    this.sprite.setDisplaySize(radius * 2, radius * 2);
    this.sprite.rotation = Math.random() * 2 * Math.PI;

    this.createPickupRing();

    TweenHelpers.spawnAnimation(scene, this, this.scaleX, this.scaleY);
  }

  private createPickupRing(): void {
    this.pickupRing = this.scene.add.graphics();
    this.pickupRing.setDepth(2);
    this.add(this.pickupRing);

    const itemRadius = gameConfig.playerRadius;
    const scaleRatio = this.pickupRadius / itemRadius;

    this.pickupRing.lineStyle(2, 0xffff00, 0.2);
    this.pickupRing.strokeCircle(0, 0, itemRadius);

    this.scene.tweens.add({
      targets: this.pickupRing,
      scaleX: scaleRatio,
      scaleY: scaleRatio,
      alpha: 0,
      duration: 3000,
      ease: "Linear",
      repeat: -1,
      onRepeat: () => {
        this.pickupRing.setScale(1, 1);
        this.pickupRing.setAlpha(0.2);
      },
    });
  }

  checkPickup(player: Phaser.GameObjects.Sprite): boolean {
    if (this.isPickedUp) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (distance <= this.pickupRadius) {
      this.pickup(player);
      return true;
    }

    return false;
  }

  protected pickup(player: Phaser.GameObjects.Sprite): void {
    if (this.isPickedUp) return;

    this.isPickedUp = true;

    if (this.pickupRing) {
      this.pickupRing.destroy();
    }

    // Tween the entire container towards player
    this.scene.tweens.add({
      targets: this,
      x: player.x,
      y: player.y,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: this.tweenDuration,
      ease: "Power2",
      onComplete: () => {
        this.onPickupComplete();
        this.destroy();
      },
    });
  }

  protected abstract onPickupComplete(): void;

  isActive(): boolean {
    return !this.isPickedUp && this.active;
  }

  // Expose sprite rotation for compatibility
  get spriteRotation(): number {
    return this.sprite.rotation;
  }

  set spriteRotation(value: number) {
    this.sprite.rotation = value;
  }
}
