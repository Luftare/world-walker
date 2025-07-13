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
}
