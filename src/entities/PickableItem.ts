import { gameConfig } from "../config/gameConfig";

export abstract class PickableItem extends Phaser.Physics.Arcade.Sprite {
  protected pickupRadius: number = gameConfig.playerRadius * 6;
  protected isPickedUp: boolean = false;
  protected tweenDuration: number = 500;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(3);

    if (this.body) {
      this.body.setSize(this.width, this.height);
      this.body.setCircle(this.width / 2);
    }

    const radius = gameConfig.playerRadius;
    this.setDisplaySize(radius * 2, radius * 2);
    this.rotation = Math.random() * 2 * Math.PI;
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

    // Tween towards player
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
}
