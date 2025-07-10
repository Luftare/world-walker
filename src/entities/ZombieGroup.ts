import Phaser from "phaser";
import { WalkingZombie } from "./WalkingZombie";

export class ZombieGroup extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  addZombie(x: number, y: number): WalkingZombie {
    const zombie = new WalkingZombie(this.scene, x, y);
    this.add(zombie);

    // Set up melee attack event listener for the new zombie
    zombie.on("meleeAttack", (attackingZombie: WalkingZombie) => {
      // Emit the event to the scene
      this.scene.events.emit("zombieMeleeAttack", attackingZombie);
    });

    return zombie;
  }

  removeZombie(zombie: WalkingZombie): void {
    zombie.destroy();
    this.remove(zombie);
  }

  setAllTargets(target: Phaser.GameObjects.Sprite): void {
    this.getChildren().forEach((child) => {
      if (child instanceof WalkingZombie) {
        child.setTarget(target);
      }
    });
  }

  setAllSpeeds(speed: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof WalkingZombie) {
        child.setSpeed(speed);
      }
    });
  }

  setAllFollowDistances(distance: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof WalkingZombie) {
        child.setFollowDistance(distance);
      }
    });
  }

  getZombies(): WalkingZombie[] {
    return this.getChildren().filter(
      (child) => child instanceof WalkingZombie
    ) as WalkingZombie[];
  }

  update(time: number, delta: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof WalkingZombie) {
        child.update(time, delta);
      }
    });
  }
}
