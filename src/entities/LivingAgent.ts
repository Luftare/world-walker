import { GameScene } from "../scenes/GameScene";
import { MovingAgent } from "./MovingAgent";

export class LivingAgent extends MovingAgent {
  public health: number = 5;
  public maxHealth: number = 5;
  public isDead: boolean = false;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    radius: number,
    maxHealth: number,
    texture: string
  ) {
    super(scene, x, y, radius, texture);

    this.health = maxHealth;
    this.maxHealth = maxHealth;
  }

  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getIsDead(): boolean {
    return this.isDead;
  }

  takeDamage(damage: number = 1): void {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - damage);
    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    if (this.isDead) return;

    this.scene.sound.play("fx-kill", {
      volume: 0.5,
    });

    this.isDead = true;
  }
}
