import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";

export class CameraSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private camera: Phaser.Cameras.Camera;
  private targetRotation: number = 0;
  private currentRotation: number = 0;

  constructor(scene: Phaser.Scene, character: Character) {
    this.scene = scene;
    this.character = character;
    this.camera = scene.cameras.main;

    this.initializeCamera();
  }

  private initializeCamera(): void {
    // Set initial camera position to character
    const characterPos = this.character.getPosition();
    this.camera.centerOn(characterPos.x, characterPos.y);

    // Configure camera bounds (optional - can be set based on game world size)
    // this.camera.setBounds(minX, minY, maxX, maxY);

    // Set camera zoom if needed
    this.camera.setZoom(1);
  }

  update(time: number, delta: number): void {
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
    const rotationSpeed = gameConfig.rotationSpeed || 0.1;
    const rotationDiff = this.targetRotation - this.currentRotation;

    // Handle rotation wrapping (shortest path)
    let adjustedDiff = rotationDiff;
    if (Math.abs(rotationDiff) > Math.PI) {
      adjustedDiff =
        rotationDiff > 0
          ? rotationDiff - 2 * Math.PI
          : rotationDiff + 2 * Math.PI;
    }

    if (Math.abs(adjustedDiff) > 0.01) {
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

  setZoom(zoom: number): void {
    this.camera.setZoom(zoom);
  }

  getZoom(): number {
    return this.camera.zoom;
  }

  // Center camera immediately on character (no smooth transition)
  centerOnCharacter(): void {
    const characterPos = this.character.getPosition();
    this.camera.centerOn(characterPos.x, characterPos.y);
  }

  // Get current camera center position in world coordinates
  getCameraCenter(): { x: number; y: number } {
    return {
      x: this.camera.scrollX + this.camera.width / 2,
      y: this.camera.scrollY + this.camera.height / 2,
    };
  }

  // Set camera bounds (useful for limiting camera movement)
  setBounds(x: number, y: number, width: number, height: number): void {
    this.camera.setBounds(x, y, width, height);
  }

  // Remove camera bounds
  removeBounds(): void {
    this.camera.removeBounds();
  }

  // Shake camera effect (useful for impacts, explosions, etc.)
  shake(duration: number = 100, intensity: number = 0.01): void {
    this.camera.shake(duration, intensity);
  }

  // Flash camera effect
  flash(
    duration: number = 250,
    red: number = 255,
    green: number = 255,
    blue: number = 255
  ): void {
    this.camera.flash(duration, red, green, blue);
  }
}
