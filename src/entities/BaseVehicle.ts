export class BaseVehicle extends Phaser.Physics.Arcade.Sprite {
  private target: Phaser.GameObjects.Sprite | null = null;
  // to target vector
  private toTargetVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private facingVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private turnWheelSpeed: number = 0.0003;
  private turnWheelAngle: number = 0;
  private turnSpeed: number = 0.004;
  private speed: number = 0.1;
  private renderScale = 0.2;

  // Movement properties
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setPosition(x, y);
    this.setDepth(10);
    this.setDisplaySize(this.getWidth(), this.getHeight());
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getWidth(): number {
    return this.renderScale * 900;
  }

  getHeight(): number {
    return this.renderScale * 600;
  }

  setTarget(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
  }

  override update(_time: number, delta: number): void {
    this.updateDirectionalVectors();
    this.updateTurnWheel(delta);
    this.updateDirection(delta);
    this.updatePosition(delta);
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

  private updatePosition(delta: number): void {
    const newX = this.x + this.facingVector.x * this.speed * delta;
    const newY = this.y + this.facingVector.y * this.speed * delta;
    this.setPosition(newX, newY);
  }
}
