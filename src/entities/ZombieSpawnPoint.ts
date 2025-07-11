import { gameConfig } from "../config/gameConfig";
import { WalkingZombie } from "./WalkingZombie";

export class ZombieSpawnPoint extends Phaser.GameObjects.GameObject {
  private x: number;
  private y: number;
  private spawnRadius: number;
  private spawnInterval: number;
  private lastSpawnTime: number = 0;
  private zombieGroup: Phaser.GameObjects.Group;
  private isActive: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spawnRadius: number = gameConfig.hexagonRadius,
    spawnInterval: number = 20000,
    zombieGroup: Phaser.GameObjects.Group
  ) {
    super(scene, "ZombieSpawnPoint");
    this.x = x;
    this.y = y;
    this.spawnRadius = spawnRadius;
    this.spawnInterval = spawnInterval;
    this.zombieGroup = zombieGroup;
  }

  private generateRandomPosition(): { x: number; y: number } {
    // Generate random angle (0 to 2π)
    const angle = Math.random() * 2 * Math.PI;

    // Generate random radius with proper area-wise distribution
    // Using square root ensures uniform distribution across the area
    const radius = Math.sqrt(Math.random()) * this.spawnRadius;

    // Convert polar coordinates to Cartesian
    const x = this.x + radius * Math.cos(angle);
    const y = this.y + radius * Math.sin(angle);

    return { x, y };
  }

  private generateRandomDirection(): number {
    return Math.random() * 2 * Math.PI;
  }

  spawnZombie(): WalkingZombie | null {
    if (!this.isActive) return null;

    const position = this.generateRandomPosition();
    const direction = this.generateRandomDirection();

    const zombie = new WalkingZombie(this.scene, position.x, position.y);

    // Set initial rotation to random direction
    zombie.setRotation(direction);

    // Add to zombie group
    this.zombieGroup.add(zombie);

    return zombie;
  }

  override update(time: number): void {
    if (!this.isActive) return;

    if (time - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnZombie();
      this.lastSpawnTime = time;
    }
  }

  setSpawnActive(active: boolean): void {
    this.isActive = active;
  }

  setSpawnInterval(interval: number): void {
    this.spawnInterval = interval;
  }

  setSpawnRadius(radius: number): void {
    this.spawnRadius = radius;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
