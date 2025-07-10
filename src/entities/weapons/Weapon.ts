export abstract class Weapon {
  protected ammo: number = -1; // -1 means unlimited ammo
  protected maxAmmo: number = -1;
  protected fireRate: number = 1000; // milliseconds between shots
  protected lastFireTime: number = 0;
  protected damage: number = 1;
  protected weaponName: string = "Unknown Weapon";

  constructor(
    ammo: number = -1,
    fireRate: number = 1000,
    damage: number = 1,
    weaponName: string = "Unknown Weapon"
  ) {
    this.ammo = ammo;
    this.maxAmmo = ammo;
    this.fireRate = fireRate;
    this.damage = damage;
    this.weaponName = weaponName;
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
}
