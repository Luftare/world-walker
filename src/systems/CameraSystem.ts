import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";

export class CameraSystem {
  private character: Character;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private targetRotation: number = 0;
  private currentRotation: number = 0;

  constructor(scene: Phaser.Scene, character: Character) {
    this.character = character;
    this.camera = scene.cameras.main;

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
    const currentCameraPos = {
      x: this.camera.scrollX + this.camera.width / 2,
      y: this.camera.scrollY + this.camera.height / 2,
    };

    // Calculate distance to character
    const dx = characterPos.x - currentCameraPos.x;
    const dy = characterPos.y - currentCameraPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move camera if character is far enough away (dead zone)
    const deadZone = 20;
    if (distance > deadZone) {
      // Smooth camera following with configurable speed
      const cameraSpeed = 0.05; // Default camera follow speed
      const lerpFactor = Math.min(cameraSpeed * (delta / 16), 1); // Normalize to 60fps

      const newX = currentCameraPos.x + dx * lerpFactor;
      const newY = currentCameraPos.y + dy * lerpFactor;

      this.camera.centerOn(newX, newY);
    }
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
