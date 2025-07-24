import { Weapon } from "./Weapon";
import { Pistol } from "./Pistol";
import { Throw } from "./Throw";
import { FullAutoGun } from "./FullAutoGun";
import { Sniper } from "./Sniper";
import { Shotgun } from "./Shotgun";
import { GameScene } from "../../scenes/GameScene";
import { Shovel } from "./Shovel";

export class WeaponInventory {
  private currentWeapon: Weapon;
  private weapons: Map<string, Weapon> = new Map();
  private sharedAmmo: number = 10; // Initial ammo pool
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.currentWeapon = new Throw(this.scene);
    this.weapons.set("throw", this.currentWeapon);
    this.weapons.set("shovel", new Shovel(this.scene));
    this.weapons.set("pistol", new Pistol(this.scene));
    this.weapons.set("fullautogun", new FullAutoGun(this.scene));
    this.weapons.set("sniper", new Sniper(this.scene));
    this.weapons.set("shotgun", new Shotgun(this.scene));
    this.setCurrentWeapon("throw");
  }

  getCurrentWeapon(): Weapon {
    return this.currentWeapon;
  }

  private updateCharacterTexture(): void {
    if (this.scene.character) {
      this.scene.character.setTexture(this.currentWeapon.characterTexture);
    }
  }

  setCurrentWeapon(weaponName: string): boolean {
    const weapon = this.weapons.get(weaponName);
    if (weapon) {
      this.currentWeapon = weapon;
      this.updateCharacterTexture();
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

  cycleToNextWeapon(): void {
    const weapons = this.getAllWeapons();
    if (weapons.length <= 1) return;

    const currentIndex = weapons.findIndex(
      (weapon) => weapon === this.currentWeapon
    );
    const nextIndex = (currentIndex + 1) % weapons.length;
    const nextWeapon = weapons[nextIndex];
    if (nextWeapon) {
      this.currentWeapon = nextWeapon;
      this.updateCharacterTexture();
    }
  }

  canShoot(currentTime: number): boolean {
    if (this.sharedAmmo <= 0) return false;
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
      this.sharedAmmo--;
      // Emit playerShot event with fireRate
      this.scene.events.emit("playerShot", this.currentWeapon.getFireRate());
      return true;
    }
    return false;
  }

  getAmmo(): number {
    return this.sharedAmmo;
  }

  addAmmo(amount: number): void {
    this.sharedAmmo += amount;
  }
}
