import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { BaseSystem } from "./BaseSystem";

export class CameraSystem implements BaseSystem {
  private character: Character;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private targetRotation: number = 0;
  private currentRotation: number = 0;
  private cameraCenter: Phaser.Math.Vector2;
  private targetPosition: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, character: Character) {
    this.character = character;
    this.camera = scene.cameras.main;
    this.cameraCenter = new Phaser.Math.Vector2();
    this.targetPosition = new Phaser.Math.Vector2();

    this.initializeCamera();
  }

  private initializeCamera(): void {
    // Set initial camera position to character
    const characterPos = this.character.getPosition();
    this.camera.centerOn(characterPos.x, characterPos.y);

    // Set camera zoom if needed
    this.camera.setZoom(window.devicePixelRatio || 1);
  }

  update(_: number, delta: number): void {
    this.updateCameraPosition(delta);
    this.updateCameraRotation(delta);
  }

  private updateCameraPosition(delta: number): void {
    const characterPos = this.character.getPosition();

    // Get current camera center using Phaser's utility
    this.camera.getWorldPoint(
      this.camera.width / 2,
      this.camera.height / 2,
      this.cameraCenter
    );

    // Set target position to character
    this.targetPosition.set(characterPos.x, characterPos.y);

    // Smooth camera following with configurable speed
    const cameraSpeed = 0.5; // Default camera follow speed
    const lerpFactor = Math.min(cameraSpeed * (delta / 16), 1); // Normalize to 60fps

    // Use Phaser's lerp utility for smooth interpolation
    const newPosition = this.cameraCenter
      .clone()
      .lerp(this.targetPosition, lerpFactor);

    this.camera.centerOn(newPosition.x, newPosition.y);
  }

  private updateCameraRotation(delta: number): void {
    // Smooth rotation interpolation
    const rotationSpeed = gameConfig.rotationSpeed;
    const rotationDiff = this.targetRotation - this.currentRotation;

    // Handle rotation wrapping (shortest path)
    let adjustedDiff = rotationDiff;
    if (Math.abs(rotationDiff) > Math.PI) {
      adjustedDiff =
        rotationDiff > 0
          ? rotationDiff - 2 * Math.PI
          : rotationDiff + 2 * Math.PI;
    }

    if (Math.abs(adjustedDiff) > 0.001) {
      const lerpFactor = Math.min(rotationSpeed * (delta / 16), 1);
      this.currentRotation += adjustedDiff * lerpFactor;

      // Keep rotation in range [0, 2π]
      this.currentRotation =
        ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      this.camera.setRotation(this.currentRotation);
    }
  }

  // Public methods for external control
  setTargetRotation(rotation: number): void {
    this.targetRotation = rotation;
  }

  getRotation(): number {
    return this.currentRotation;
  }
}
