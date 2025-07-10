import { Weapon } from "./Weapon";
import { Pistol } from "./Pistol";
import { FullAutoGun } from "./FullAutoGun";
import { Sniper } from "./Sniper";
import { Shotgun } from "./Shotgun";

export class WeaponInventory {
  private currentWeapon: Weapon;
  private weapons: Map<string, Weapon> = new Map();

  constructor() {
    // Start with a sniper
    this.currentWeapon = new Sniper();
    this.weapons.set("sniper", this.currentWeapon);
    this.weapons.set("fullautogun", new FullAutoGun());
    this.weapons.set("pistol", new Pistol());
    this.weapons.set("shotgun", new Shotgun());
    this.setCurrentWeapon("shotgun");
  }

  getCurrentWeapon(): Weapon {
    return this.currentWeapon;
  }

  setCurrentWeapon(weaponName: string): boolean {
    const weapon = this.weapons.get(weaponName);
    if (weapon) {
      this.currentWeapon = weapon;
      return true;
    }
    return false;
  }

  addWeapon(weapon: Weapon): void {
    this.weapons.set(weapon.getWeaponName().toLowerCase(), weapon);
  }

  removeWeapon(weaponName: string): boolean {
    if (
      this.currentWeapon.getWeaponName().toLowerCase() ===
      weaponName.toLowerCase()
    ) {
      // Don't remove the current weapon
      return false;
    }
    return this.weapons.delete(weaponName.toLowerCase());
  }

  getWeapon(weaponName: string): Weapon | undefined {
    return this.weapons.get(weaponName.toLowerCase());
  }

  getAllWeapons(): Weapon[] {
    return Array.from(this.weapons.values());
  }

  canShoot(currentTime: number): boolean {
    return this.currentWeapon.canShoot(currentTime);
  }

  shoot(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: { x: number; y: number },
    currentTime: number
  ): boolean {
    if (this.canShoot(currentTime)) {
      this.currentWeapon.fire(currentTime);
      this.currentWeapon.shoot(scene, x, y, direction);
      return true;
    }
    return false;
  }
}
