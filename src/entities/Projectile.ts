// Projectile class for shooting mechanics
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 8 * 100;
  private timeToLive: number = 1500;
  private startTime: number;
  private damage: number = 1;
  public radius: number = 8;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number },
    damage: number = 1
  ) {
    super(scene, x, y, "projectile");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(5);

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

    this.damage = damage;
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

  getDamage(): number {
    return this.damage;
  }
}
