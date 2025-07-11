export abstract class Weapon {
  protected fireRate: number = 1000; // milliseconds between shots
  protected lastFireTime: number = 0;
  protected damage: number = 1;
  protected weaponName: string = "Unknown Weapon";
  protected shakeIntensity: number = 0.003; // Screen shake intensity
  protected shakeDuration: number = 100; // Screen shake duration in milliseconds

  constructor(
    fireRate: number = 1000,
    damage: number = 1,
    weaponName: string = "Unknown Weapon",
    shakeIntensity: number = 0.003,
    shakeDuration: number = 100
  ) {
    this.fireRate = fireRate;
    this.damage = damage;
    this.weaponName = weaponName;
    this.shakeIntensity = shakeIntensity;
    this.shakeDuration = shakeDuration;
  }

  abstract shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number }
  ): void;

  canShoot(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= this.fireRate;
  }

  fire(currentTime: number): void {
    this.lastFireTime = currentTime;
  }

  getWeaponName(): string {
    return this.weaponName;
  }

  getFireRate(): number {
    return this.fireRate;
  }

  getDamage(): number {
    return this.damage;
  }

  getShakeIntensity(): number {
    return this.shakeIntensity;
  }

  getShakeDuration(): number {
    return this.shakeDuration;
  }
}
