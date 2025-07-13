import { Projectile } from "../entities/Projectile";
import { AmmoPack } from "../entities/AmmoPack";
import { Coin } from "../entities/Coin";
import { HealthPack } from "../entities/HealthPack";
import { PickableItem } from "../entities/PickableItem";
import { Character } from "../entities/Character";

export class GameLogic {
  /**
   * Updates all projectiles, removing inactive ones and calling their update method.
   * @param projectiles Array of projectiles
   * @param time Current time
   * @returns Filtered array of active projectiles
   */
  static updateProjectiles(
    projectiles: Projectile[],
    time: number
  ): Projectile[] {
    return projectiles.filter((projectile) => {
      if (!projectile.active) return false;
      projectile.update(time);
      return projectile.active;
    });
  }

  /**
   * Checks projectile collisions with zombies, applies damage and pushback, and destroys projectiles on hit.
   * @param projectiles Array of projectiles
   * @param zombies Array of zombies
   * @param projectilePushbackForce Pushback force from config
   */
  static checkProjectileCollisions(
    projectiles: Projectile[],
    zombies: any[],
    projectilePushbackForce: number
  ): void {
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      for (const zombie of zombies) {
        if (!zombie.active || zombie.getIsDead()) continue;
        const distance = Phaser.Math.Distance.Between(
          projectile.x,
          projectile.y,
          zombie.x,
          zombie.y
        );
        const collisionRadius = 20;
        if (distance < collisionRadius) {
          const projectileDirection = projectile.getDirection();
          zombie.takeDamage(projectile.getDamage(), projectileDirection);
          zombie.applyPushback(projectileDirection, projectilePushbackForce);
          projectile.destroy();
          break;
        }
      }
    }
  }

  /**
   * Generic method to check pickups for any type of pickable item
   * @param items Array of pickable items
   * @param character The player character
   * @param onPickup Callback function when item is picked up
   * @returns Filtered array of items that weren't picked up
   */
  static checkPickups<T extends PickableItem>(
    items: T[],
    character: Character,
    onPickup: (item: T) => void
  ): T[] {
    return items.filter((item) => {
      if (!item.isActive()) return false;

      const wasPickedUp = item.checkPickup(character);
      if (wasPickedUp) {
        onPickup(item);
      }
      return !wasPickedUp;
    });
  }

  /**
   * Spawns loot from a zombie death at the given position
   * @param x X coordinate of zombie death
   * @param y Y coordinate of zombie death
   * @param scene The Phaser scene
   * @param ammoPacks Array to add ammo packs to
   * @param coins Array to add coins to
   * @param healthPacks Array to add health packs to
   */
  static spawnLootFromZombie(
    x: number,
    y: number,
    scene: Phaser.Scene,
    ammoPacks: AmmoPack[],
    coins: Coin[],
    healthPacks: HealthPack[]
  ): void {
    const randomValue = Math.random();
    let item: AmmoPack | Coin | HealthPack | undefined;

    if (randomValue < 0.1) {
      // Spawn coin
      item = new Coin(scene, x, y);
      coins.push(item);
    } else if (randomValue < 0.2) {
      // Spawn health pack
      item = new HealthPack(scene, x, y);
      healthPacks.push(item);
    } else if (randomValue < 0.6) {
      // Spawn ammo pack
      item = new AmmoPack(scene, x, y);
      ammoPacks.push(item);
    }

    if (!item) return;

    // Tween item to random direction
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = 20 + Math.random() * 20;
    const targetX = x + Math.cos(randomAngle) * randomDistance;
    const targetY = y + Math.sin(randomAngle) * randomDistance;

    scene.tweens.add({
      targets: item,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Power2",
    });
  }
}
