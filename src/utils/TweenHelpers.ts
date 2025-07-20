import { PickableItem } from "../entities/PickableItem";
import { GameScene } from "../scenes/GameScene";

export class TweenHelpers {
  static spawnAnimation(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
    originalScaleX: number,
    originalScaleY: number
  ): void {
    target.setScale(0.0001);

    scene.tweens.add({
      targets: target,
      scaleX: originalScaleX * 1.2,
      scaleY: originalScaleY * 1.2,
      duration: 400,
      ease: "Back.easeOut",
      onComplete: () => {
        scene.tweens.add({
          targets: target,
          scaleX: originalScaleX,
          scaleY: originalScaleY,
          duration: 200,
          ease: "Power2",
        });
      },
    });
  }

  static takeDamageAnimation(
    entity: Phaser.Physics.Arcade.Sprite,
    scene: GameScene
  ): void {
    // Create a red flash effect on the player
    entity.setTint(0xff0000);

    scene.tweens.add({
      targets: entity,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        entity.clearTint(); // Always clear tint to ensure it returns to normal
      },
    });
  }

  static bounceAtRandomDirection(
    entity: Phaser.Physics.Arcade.Sprite | PickableItem,
    scene: GameScene
  ): void {
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = 20 + Math.random() * 20;
    const targetX = entity.x + Math.cos(randomAngle) * randomDistance;
    const targetY = entity.y + Math.sin(randomAngle) * randomDistance;

    scene.tweens.add({
      targets: entity,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Power2",
    });
  }

  static bounceAtDirection(
    entity: Phaser.Physics.Arcade.Sprite | PickableItem,
    scene: GameScene,
    direction: Phaser.Math.Vector2
  ): void {
    const randomDistance = 20 + Math.random() * 20;
    const targetVector = direction
      .clone()
      .normalize()
      .rotate(Math.random() - 0.5)
      .scale(randomDistance);

    const targetX = entity.x + targetVector.x;
    const targetY = entity.y + targetVector.y;

    scene.tweens.add({
      targets: entity,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Power2",
    });
  }
}
