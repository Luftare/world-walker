export abstract class Weapon {
  protected ammo: number = -1; // -1 means unlimited ammo
  protected maxAmmo: number = -1;
  protected fireRate: number = 1000; // milliseconds between shots
  protected lastFireTime: number = 0;
  protected damage: number = 1;
  protected weaponName: string = "Unknown Weapon";
  protected shakeIntensity: number = 0.003; // Screen shake intensity
  protected shakeDuration: number = 100; // Screen shake duration in milliseconds

  constructor(
    ammo: number = -1,
    fireRate: number = 1000,
    damage: number = 1,
    weaponName: string = "Unknown Weapon",
    shakeIntensity: number = 0.003,
    shakeDuration: number = 100
  ) {
    this.ammo = ammo;
    this.maxAmmo = ammo;
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
    if (this.ammo === 0) return false;
    return currentTime - this.lastFireTime >= this.fireRate;
  }

  fire(currentTime: number): void {
    this.lastFireTime = currentTime;
    if (this.ammo > 0) {
      this.ammo--;
    }
  }

  getAmmo(): number {
    return this.ammo;
  }

  getMaxAmmo(): number {
    return this.maxAmmo;
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

  isUnlimitedAmmo(): boolean {
    return this.ammo === -1;
  }

  getShakeIntensity(): number {
    return this.shakeIntensity;
  }

  getShakeDuration(): number {
    return this.shakeDuration;
  }
}
