export class BaseVehicle extends Phaser.Physics.Arcade.Sprite {
  private target: Phaser.GameObjects.Sprite | null = null;
  // to target vector
  private toTargetVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private facingVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private turnWheelSpeed: number = 0.0005;
  private turnWheelAngle: number = 0;
  private turnSpeed: number = 0.000002;
  private speed: number = 70;

  // Movement properties
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    // add to scene
    scene.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(10);
    const scale = 0.2;
    const width = 900 * scale;
    const height = 600 * scale;
    this.setDisplaySize(width, height);

    // add to physics
    scene.physics.add.existing(this);
  }

  setTarget(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
  }

  override update(_time: number, delta: number): void {
    this.updateDirectionalVectors();
    this.updateTurnWheel(delta);
    this.updateDirection(delta);
    this.updateVelocity();
  }

  private updateDirectionalVectors(): void {
    this.facingVector.set(Math.cos(this.rotation), Math.sin(this.rotation));
    if (this.target) {
      this.toTargetVector.set(this.target.x - this.x, this.target.y - this.y);
    }
  }

  private updateTurnWheel(delta: number): void {
    const crossProduct =
      this.facingVector.x * this.toTargetVector.y -
      this.facingVector.y * this.toTargetVector.x;
    const turnDirection = crossProduct > 0 ? 1 : -1;
    this.turnWheelAngle += turnDirection * this.turnWheelSpeed * delta;
    this.turnWheelAngle = Phaser.Math.Clamp(this.turnWheelAngle, -1, 1);
  }

  private updateDirection(delta: number): void {
    const angleDifference =
      this.turnWheelAngle * this.turnSpeed * this.speed * delta;
    const newRotation = this.rotation + angleDifference;
    this.setRotation(newRotation);
  }

  private updateVelocity(): void {
    const speed = this.speed;
    this.setVelocity(this.facingVector.x * speed, this.facingVector.y * speed);
  }
}
