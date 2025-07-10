// Projectile class for shooting mechanics

import { gameConfig } from "../config/gameConfig";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private speed: number = gameConfig.scale * 8;
  private timeToLive: number = 5000; // 5 seconds in milliseconds
  private startTime: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ) {
    super(scene, x, y, "projectile");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(15); // Higher than character and zombies

    // Set up physics body
    const size = gameConfig.scale * 2;
    if (this.body) {
      this.body.setSize(size, size); // Small collision box
      this.body.setCircle(size * 0.5);
    }

    // Set display size
    this.setDisplaySize(size, size);

    // Set velocity based on direction
    const normalizedDirection = new Phaser.Math.Vector2(
      direction.x,
      direction.y
    ).normalize();
    this.setVelocity(
      normalizedDirection.x * this.speed,
      normalizedDirection.y * this.speed
    );

    this.startTime = scene.time.now;
  }

  override update(time: number): void {
    // Check if projectile has exceeded time to live
    if (time - this.startTime > this.timeToLive) {
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
      return new Phaser.Math.Vector2(
        this.body.velocity.x,
        this.body.velocity.y
      ).normalize();
    }
    return new Phaser.Math.Vector2(0, 0);
  }
}
