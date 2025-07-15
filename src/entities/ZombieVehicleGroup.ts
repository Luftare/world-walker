import Phaser from "phaser";
import { BaseVehicle } from "./BaseVehicle";

export class ZombieVehicleGroup extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  addZombieVehicle(x: number, y: number): BaseVehicle {
    const vehicle = new BaseVehicle(this.scene, x, y, "zombie-tractor");
    this.add(vehicle);

    return vehicle;
  }

  removeZombieVehicle(vehicle: BaseVehicle): void {
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

  getZombies(): BaseVehicle[] {
    return this.getChildren().filter(
      (child) => child instanceof BaseVehicle
    ) as BaseVehicle[];
  }

  update(time: number, delta: number): void {
    this.getChildren().forEach((child) => {
      if (child instanceof BaseVehicle) {
        child.update(time, delta);
      }
    });
  }
}
