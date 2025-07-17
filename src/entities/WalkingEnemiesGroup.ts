import Phaser from "phaser";
import { WalkingZombie } from "./WalkingZombie";
import { GameScene } from "../scenes/GameScene";
import { BaseEnemy } from "./BaseEnemy";
import { Character } from "./Character";

export class WalkingEnemiesGroup extends Phaser.GameObjects.Group {
  override scene: GameScene;
  constructor(scene: GameScene) {
    super(scene);
    this.scene = scene;
  }

  addZombie(x: number, y: number): BaseEnemy {
    const zombie = new WalkingZombie(this.scene, x, y);
    this.add(zombie);

    // Set up melee attack event listener for the new zombie
    zombie.on("meleeAttack", (attackingZombie: BaseEnemy) => {
      // Emit the event to the scene
      this.scene.events.emit("zombieMeleeAttack", attackingZombie);
    });

    return zombie;
  }

  removeEntity(entity: BaseEnemy): void {
    entity.destroy();
    this.remove(entity);
  }

  setAllTargets(target: Character): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseEnemy) {
        child.setTarget(target);
      }
    });
  }

  setAllSpeeds(speed: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseEnemy) {
        child.setSpeed(speed);
      }
    });
  }

  setAllFollowDistances(distance: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseEnemy) {
        child.setFollowDistance(distance);
      }
    });
  }

  getEntities(): BaseEnemy[] {
    return this.getChildren().filter(
      (child) => child instanceof BaseEnemy
    ) as BaseEnemy[];
  }

  update(time: number, delta: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseEnemy) {
        child.update(time, delta);
      }
    });
  }
}
