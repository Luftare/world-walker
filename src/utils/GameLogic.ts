import { Projectile } from "../entities/Projectile";
import { AmmoPack } from "../entities/AmmoPack";
import { Coin } from "../entities/Coin";
import { HealthPack } from "../entities/HealthPack";
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
   * Checks all pickups for the given arrays of items
   * @param ammoPacks Array of ammo packs
   * @param coins Array of coins
   * @param healthPacks Array of health packs
   * @param character The player character
   * @param scene The Phaser scene
   * @param spawnService The spawn service for item pickup notifications
   * @returns Object containing filtered arrays of remaining items
   */
  static checkAllPickups(
    ammoPacks: AmmoPack[],
    coins: Coin[],
    healthPacks: HealthPack[],
    character: Character,
    scene: Phaser.Scene,
    spawnService?: any
  ): {
    ammoPacks: AmmoPack[];
    coins: Coin[];
    healthPacks: HealthPack[];
  } {
    const { events } = scene;

    const filteredAmmoPacks = ammoPacks.filter((ammoPack) => {
      if (!ammoPack.isActive()) return false;
      const wasPickedUp = ammoPack.checkPickup(character);
      if (wasPickedUp && spawnService) {
        spawnService.onItemPickedUp(ammoPack);
      }
      return !wasPickedUp;
    });

    const filteredCoins = coins.filter((coin) => {
      if (!coin.isActive()) return false;
      const wasPickedUp = coin.checkPickup(character);
      if (wasPickedUp) {
        events.emit("coinPickedUp");
        if (spawnService) {
          spawnService.onItemPickedUp(coin);
        }
      }
      return !wasPickedUp;
    });

    const filteredHealthPacks = healthPacks.filter((healthPack) => {
      if (!healthPack.isActive()) return false;
      const wasPickedUp = healthPack.checkPickup(character);
      if (wasPickedUp && spawnService) {
        spawnService.onItemPickedUp(healthPack);
      }
      return !wasPickedUp;
    });

    return {
      ammoPacks: filteredAmmoPacks,
      coins: filteredCoins,
      healthPacks: filteredHealthPacks,
    };
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
    const { tweens } = scene;
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

    tweens.add({
      targets: item,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Power2",
    });
  }
}
