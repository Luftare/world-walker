import { GameScene } from "../scenes/GameScene";
import { TweenHelpers } from "../utils/TweenHelpers";
import { AmmoPack } from "./AmmoPack";

// Projectile class for shooting mechanics
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private timeToLive: number = 1000;
  private startTime: number;
  private damage: number = 1;
  public radius: number = 6;
  public direction: Phaser.Math.Vector2;
  override scene: GameScene;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    direction: { x: number; y: number },
    damage: number = 1,
    speed: number = 800
  ) {
    super(scene, x, y, "projectile");
    this.scene = scene;
    this.speed = speed;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.direction = new Phaser.Math.Vector2(direction.x, direction.y);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(6);

    // Set up physics body
    if (this.body) {
      this.body.setSize(this.radius * 2, this.radius * 2);
      this.body.setCircle(this.radius);
    }

    this.setDisplaySize(this.radius * 2, this.radius * 2);

    const normalizedDirection = new Phaser.Math.Vector2(
      direction.x,
      direction.y
    ).normalize();

    this.setVelocity(
      normalizedDirection.x * this.speed,
      normalizedDirection.y * this.speed
    );

    this.setRotation(Math.atan2(normalizedDirection.y, normalizedDirection.x));

    const startScaleX = this.scaleX;
    const startScaleY = this.scaleY;

    // Rotate projectile randomly
    this.scene.tweens.add({
      targets: this,
      rotation: this.rotation + (Math.random() - 0.5) * Math.PI * 4,
      duration: this.timeToLive,
      ease: "Linear",
      repeat: -1,
    });

    // Illusion of flight in arc
    this.scene.tweens.add({
      targets: this,
      scaleX: startScaleX * 1.4,
      scaleY: startScaleY * 1.4,
      duration: this.timeToLive / 2,
      yoyo: true,
      repeat: -1,
      ease: "Linear",
    });

    this.damage = damage;
    this.startTime = scene.time.now;
  }

  bounceAsPickableItem(): void {
    const potato = new AmmoPack(this.scene, this.x, this.y);
    this.scene.pickableItems.push(potato);
    TweenHelpers.bounceAtRandomDirection(potato, this.scene);
  }

  override update(time: number): void {
    // Check if projectile has exceeded time to live
    if (time - this.startTime > this.timeToLive) {
      this.bounceAsPickableItem();
      this.destroy();
    }
    // Any additional per-frame logic can go here
  }

  getSpeed(): number {
    return this.speed;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getTimeToLive(): number {
    return this.timeToLive;
  }

  setTimeToLive(ttl: number): void {
    this.timeToLive = ttl;
  }

  getDirection(): Phaser.Math.Vector2 {
    if (this.body) {
      return this.direction
        .set(this.body.velocity.x, this.body.velocity.y)
        .normalize();
    }
    return new Phaser.Math.Vector2(0, 0);
  }

  getDamage(): number {
    return this.damage;
  }
}
