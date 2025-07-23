import { Projectile } from "../entities/Projectile";
import { AmmoPack } from "../entities/AmmoPack";
import { Cogwheel } from "../entities/Cogwheel";
import { HealthPack } from "../entities/HealthPack";
import { Character } from "../entities/Character";
import { PickableItem } from "../entities/PickableItem";
import { BaseEnemy } from "../entities/BaseEnemy";
import { GameScene } from "../scenes/GameScene";
import { TweenHelpers } from "./TweenHelpers";
import { GameLogicHelpers } from "./gameLogicHelpers";

export class GameLogic {
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

  static checkProjectileCollisions(
    projectiles: Projectile[],
    zombies: BaseEnemy[],
    projectilePushbackForce: number
  ): void {
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      for (const zombie of zombies) {
        if (!zombie.active || zombie.getIsDead()) continue;
        const collisionRadius = projectile.radius + zombie.radius;
        if (
          GameLogicHelpers.isWithinRange(projectile, zombie, collisionRadius)
        ) {
          const projectileDirection = projectile.getDirection();
          zombie.takeDamage(projectile.getDamage(), projectileDirection);
          zombie.applyPushback(
            projectileDirection.clone().scale(projectilePushbackForce)
          );
          if (projectile.isPiercing && !projectile.hasHitZombie(zombie)) {
            projectile.markZombieHit(zombie);
          } else {
            projectile.destroy();
            break;
          }
        }
      }
    }
  }

  static checkAllPickups(
    pickableItems: PickableItem[],
    character: Character,
    spawnService?: any
  ): PickableItem[] {
    const filteredPickableItems = pickableItems.filter((item) => {
      if (!item.isActive()) return false;
      const wasPickedUp = item.checkPickup(character);
      if (wasPickedUp && spawnService) {
        spawnService.onItemPickedUp(item);
      }
      return !wasPickedUp;
    });

    return filteredPickableItems;
  }

  static spawnLootFromZombie(
    x: number,
    y: number,
    scene: GameScene,
    pickableItems: PickableItem[]
  ): void {
    const randomValue = Math.random();
    let item: PickableItem | undefined;

    if (randomValue < 0.05) {
      // Spawn cogwheel
      item = new Cogwheel(scene, x, y);
      pickableItems.push(item);
    } else if (randomValue < 0.1) {
      // Spawn health pack
      item = new HealthPack(scene, x, y);
      pickableItems.push(item);
    } else if (randomValue < 0.5) {
      // Spawn ammo pack
      item = new AmmoPack(scene, x, y);
      pickableItems.push(item);
    }

    if (!item) return;

    TweenHelpers.bounceAtRandomDirection(item, scene);
  }

  static handleZombieMeleeAttack(zombie: BaseEnemy, scene: GameScene): void {
    if (!scene.character || scene.character.getIsDead()) return;

    // Check if zombie is actually in attack range
    if (!zombie.targetIsInAttackRange()) return;

    // Deal damage to player
    scene.character.takeDamage(1);

    // Apply pushback to the character
    const impulse = new Phaser.Math.Vector2(
      scene.character.x - zombie.x,
      scene.character.y - zombie.y
    )
      .normalize()
      .scale(400);
    scene.character.applyPushback(impulse);

    // Add screen shake for feedback
    scene.cameras.main.shake(100, 0.002);

    // Create hit effect on player
    TweenHelpers.takeDamageAnimation(scene.character, scene);
  }

  static checkAngledRectangleCollisionWithCircle(
    circleCenter: { x: number; y: number },
    circleRadius: number,
    rectWidth: number,
    rectHeight: number,
    rectCenter: { x: number; y: number },
    rectAngle: number // in radians
  ): boolean {
    // Rotate circle center into rectangle's local space (inverse rotate around rect center)
    const dx = circleCenter.x - rectCenter.x;
    const dy = circleCenter.y - rectCenter.y;
    const cos = Math.cos(-rectAngle);
    const sin = Math.sin(-rectAngle);

    const localX = cos * dx - sin * dy;
    const localY = sin * dx + cos * dy;

    // Rectangle is now axis-aligned from (-w/2, -h/2) to (w/2, h/2)
    const halfW = rectWidth / 2;
    const halfH = rectHeight / 2;

    // Clamp the local circle center to the bounds of the rectangle
    const closestX = Phaser.Math.Clamp(localX, -halfW, halfW);
    const closestY = Phaser.Math.Clamp(localY, -halfH, halfH);

    // Compute distance from circle to closest point
    const distX = localX - closestX;
    const distY = localY - closestY;

    return distX * distX + distY * distY <= circleRadius * circleRadius;
  }
}
