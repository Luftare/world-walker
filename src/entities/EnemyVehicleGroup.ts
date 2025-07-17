import Phaser from "phaser";
import { BaseVehicle } from "./BaseVehicle";
import { Character } from "./Character";
import { BaseEnemy } from "./BaseEnemy";
import { GameLogic } from "../utils/GameLogic";
import { CircularEntity } from "./CircularEntity";

export class EnemyVehicleGroup extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  addZombieVehicle(x: number, y: number): BaseVehicle {
    const vehicle = new BaseVehicle(this.scene, x, y, "zombie-tractor");
    this.add(vehicle);

    return vehicle;
  }

  removeVehicle(vehicle: BaseVehicle): void {
    vehicle.destroy();
    this.remove(vehicle);
  }

  setAllTargets(target: Phaser.GameObjects.Sprite): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseVehicle) {
        child.setTarget(target);
      }
    });
  }

  getEntities(): BaseVehicle[] {
    return this.getChildren().filter(
      (child) => child instanceof BaseVehicle
    ) as BaseVehicle[];
  }

  update(time: number, delta: number): void {
    this.getChildren().forEach((child) => {
      child.update(time, delta);
    });
  }

  checkCollisions(targets: CircularEntity[]): void {
    const tractors = this.getChildren() as BaseVehicle[];
    tractors.forEach((tractor) => {
      targets.forEach((target) => {
        const tractorPosition = tractor.getPosition();
        const targetPosition = target.getPosition();
        const tractorWidth = tractor.getWidth();
        const tractorHeight = tractor.getHeight();

        // Broad-phase: quick distance check
        const tractorRadius = Math.max(tractorWidth, tractorHeight) * 0.708; // Handle rect corners in extreme case of square
        const dx = targetPosition.x - tractorPosition.x;
        const dy = targetPosition.y - tractorPosition.y;
        const distanceSq = dx * dx + dy * dy;
        const combinedRadius = tractorRadius + target.radius;

        if (distanceSq > combinedRadius * combinedRadius) return; // too far, skip expensive check

        const isCollision = GameLogic.checkAngledRectangleCollisionWithCircle(
          targetPosition,
          target.radius,
          tractorWidth,
          tractorHeight,
          tractorPosition,
          tractor.rotation
        );
        if (isCollision) {
          const impact = new Phaser.Math.Vector2(
            targetPosition.x - tractorPosition.x,
            targetPosition.y - tractorPosition.y
          )
            .normalize()
            .scale(1200);
          target.applyPushback(impact);
        }
      });
    });
  }
}
