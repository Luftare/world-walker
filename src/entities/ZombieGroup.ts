import Phaser from "phaser";
import { Zombie } from "./Zombie";

export class ZombieGroup extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  addZombie(x: number, y: number): Zombie {
    const zombie = new Zombie(this.scene, x, y);
    this.add(zombie);

    // Set up melee attack event listener for the new zombie
    zombie.on("meleeAttack", (zombie: Zombie) => {
      console.log("Zombie attacka!");
      // Emit the event to the scene
      this.scene.events.emit("zombieMeleeAttack", zombie);
    });

    return zombie;
  }

  removeZombie(zombie: Zombie): void {
    zombie.destroy();
    this.remove(zombie);
  }

  setAllTargets(target: Phaser.GameObjects.Sprite): void {
    this.getChildren().forEach((child) => {
      if (child instanceof Zombie) {
        child.setTarget(target);
      }
    });
  }

  setAllSpeeds(speed: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof Zombie) {
        child.setSpeed(speed);
      }
    });
  }

  setAllFollowDistances(distance: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof Zombie) {
        child.setFollowDistance(distance);
      }
    });
  }

  getZombies(): Zombie[] {
    return this.getChildren().filter(
      (child) => child instanceof Zombie
    ) as Zombie[];
  }

  update(time: number, delta: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof Zombie) {
        child.update(time, delta);
      }
    });
  }
}
