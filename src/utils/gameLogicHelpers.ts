import { BaseEnemy } from "../entities/BaseEnemy";
import { Character } from "../entities/Character";
import { PickableItem } from "../entities/PickableItem";
import { GameScene } from "../scenes/GameScene";
import { Point } from "../types/types";

export class GameLogicHelpers {
  /**
   * Checks if an entity should be avoided in flocking behavior
   * @param entity - The entity to check
   * @param currentEntity - The entity performing the check
   * @returns True if the entity should be avoided
   */
  static shouldAvoidEntity(
    entity: Character | BaseEnemy,
    currentEntity: Character | BaseEnemy
  ): boolean {
    return (
      GameLogicHelpers.isAvoidableEntity(entity) &&
      entity.active &&
      entity !== currentEntity
    );
  }

  /**
   * Checks if an entity is a pickable item
   * @param entity - The entity to check
   * @returns True if the entity is a pickable item
   */
  static isPickableItem(entity: any): boolean {
    return entity instanceof PickableItem;
  }

  /**
   * Checks if an entity is an an avoidable entity
   * @param entity - The entity to check
   * @returns True if the entity is an avoidable entity
   */
  static isAvoidableEntity(entity: any): boolean {
    return entity instanceof BaseEnemy || entity instanceof Character;
  }

  /**
   * Gets all entities that should be avoided for flocking behavior
   * @param scene - The Phaser scene
   * @param currentEntity - The entity performing the check
   * @returns Array of entities that should be avoided
   */
  static getAvoidableEntities(
    scene: GameScene,
    currentEntity: Character | BaseEnemy
  ): (Character | BaseEnemy)[] {
    return scene.children.list
      .filter((child: any) =>
        GameLogicHelpers.shouldAvoidEntity(child, currentEntity)
      )
      .map((child: any) => child as Character | BaseEnemy);
  }

  /**
   * Calculates distance between two points
   * @param x1 - First point x coordinate
   * @param y1 - First point y coordinate
   * @param x2 - Second point x coordinate
   * @param y2 - Second point y coordinate
   * @returns Distance between the points
   */
  static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2);
  }

  /**
   * Creates a normalized vector pointing from one point to another
   * @param fromX - Starting point x coordinate
   * @param fromY - Starting point y coordinate
   * @param toX - Target point x coordinate
   * @param toY - Target point y coordinate
   * @returns Normalized vector
   */
  static createDirectionVector(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(toX - fromX, toY - fromY).normalize();
  }

  /**
   * Creates a normalized vector pointing away from one point to another
   * @param fromX - Starting point x coordinate
   * @param fromY - Starting point y coordinate
   * @param awayFromX - Point to avoid x coordinate
   * @param awayFromY - Point to avoid y coordinate
   * @returns Normalized vector pointing away
   */
  static createAvoidanceVector(
    fromX: number,
    fromY: number,
    awayFromX: number,
    awayFromY: number
  ): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      fromX - awayFromX,
      fromY - awayFromY
    ).normalize();
  }

  /**
   * Calculates weight based on distance and radius
   * @param distance - Current distance
   * @param radius - Maximum radius for full weight
   * @returns Weight value between 0 and 1
   */
  static calculateDistanceWeight(distance: number, radius: number): number {
    return Math.max(0, (radius - distance) / radius);
  }

  /**
   * Checks if an entity is within a certain range of another entity
   * @param entity1 - First entity
   * @param entity2 - Second entity
   * @param range - Maximum range to check
   * @returns True if entities are within range
   */
  static isWithinRange(entity1: any, entity2: any, range: number): boolean {
    const distanceSq =
      (entity1.x - entity2.x) ** 2 + (entity1.y - entity2.y) ** 2;
    return distanceSq <= range ** 2;
  }
}
