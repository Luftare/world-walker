import { gameConfig } from "../config/gameConfig";
import { BaseEnemy } from "./BaseEnemy";
import { GameScene } from "../scenes/GameScene";

export class WalkingZombie extends BaseEnemy {
  constructor(scene: GameScene, x: number = 0, y: number = 0) {
    super(scene, x, y, 3, gameConfig.enemySpeed);
    this.scene = scene;
  }

  protected performAttack(): void {
    if (this.isAttacking) return;
    if (!this.isFacingTarget()) return;

    this.isAttacking = true;
    this.lastAttackTime = this.scene.time.now;

    const originalX = this.x;
    const originalY = this.y;
    const originalScaleX = this.scaleX;
    const originalScaleY = this.scaleY;

    let jumpDirectionX = 0;
    let jumpDirectionY = 0;
    if (this.targetEntity) {
      const dx = this.targetEntity.x - this.x;
      const dy = this.targetEntity.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const jumpDistance = 20;
        jumpDirectionX = (dx / distance) * jumpDistance;
        jumpDirectionY = (dy / distance) * jumpDistance;
      }
    }

    this.scene.tweens.add({
      targets: this,
      x: originalX + jumpDirectionX,
      y: originalY + jumpDirectionY,
      scaleX: originalScaleX * 1.2,
      scaleY: originalScaleY * 1.2,
      duration: 50,
      ease: "Power2",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          x: originalX,
          y: originalY,
          scaleX: originalScaleX,
          scaleY: originalScaleY,
          duration: 200,
          ease: "Power2",
          onComplete: () => {
            this.isAttacking = false;
          },
        });
      },
    });

    this.emit("meleeAttack", this);
  }
}
