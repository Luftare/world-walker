import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { CameraSystem } from "./CameraSystem";
import { BaseSystem } from "./BaseSystem";
import { Character } from "../entities/Character";

export class DebugSystem implements BaseSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private cameraSystem: CameraSystem | undefined;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key | undefined } = {};
  private isEnabled: boolean;

  constructor(
    scene: Phaser.Scene,
    character: Character,
    cameraSystem?: CameraSystem
  ) {
    this.scene = scene;
    this.character = character;
    this.cameraSystem = cameraSystem || undefined;
    this.isEnabled = gameConfig.devMode;
    this.character.setRotation(-Math.PI * 0.5);

    if (this.isEnabled) {
      this.initializeDebugControls();
    }
  }

  private initializeDebugControls(): void {
    // Initialize keyboard controls for debug movement
    this.keys = {
      Q: this.scene?.input?.keyboard?.addKey("Q"),
      E: this.scene?.input?.keyboard?.addKey("E"),
      X: this.scene?.input?.keyboard?.addKey("X"),
    };

    // Set up key event listeners
    this.keys["X"]?.on("down", () => {
      this.toggleDebugMode();
    });
  }

  update(_: number, delta: number): void {
    this.handleDebugMovement(delta);
  }

  private handleDebugMovement(delta: number): void {
    const rotationSpeed = gameConfig.rotationSpeed;
    const deltaSeconds = delta / 1000;

    // QE rotation for camera
    if (this.cameraSystem) {
      if (this.keys["Q"]?.isDown) {
        const currentRotation = this.cameraSystem.getRotation();
        this.cameraSystem.setTargetRotation(
          currentRotation + rotationSpeed * deltaSeconds
        );
        this.character.setRotation(
          this.character.rotation - rotationSpeed * deltaSeconds
        );
      }
      if (this.keys["E"]?.isDown) {
        const currentRotation = this.cameraSystem.getRotation();
        this.cameraSystem.setTargetRotation(
          currentRotation - rotationSpeed * deltaSeconds
        );
        this.character.setRotation(
          this.character.rotation + rotationSpeed * deltaSeconds
        );
      }
    }
  }

  private toggleDebugMode(): void {
    this.isEnabled = !this.isEnabled;
  }

  // Public methods for external control
  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  setDebugEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Cleanup method
  destroy(): void {
    // No cleanup needed since we removed debug graphics
  }
}
