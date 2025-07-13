import { Projectile } from "../entities/Projectile";

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
}
