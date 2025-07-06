import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { PositionMarker } from "../entities/PositionMarker";
import { CameraSystem } from "./CameraSystem";

export class DebugSystem {
  private scene: Phaser.Scene;
  private positionMarker: PositionMarker;
  private cameraSystem: CameraSystem | undefined;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key | undefined } = {};
  private isEnabled: boolean;

  constructor(
    scene: Phaser.Scene,
    positionMarker: PositionMarker,
    cameraSystem?: CameraSystem
  ) {
    this.scene = scene;
    this.positionMarker = positionMarker;
    this.cameraSystem = cameraSystem || undefined;
    this.isEnabled = gameConfig.devMode;

    if (this.isEnabled) {
      this.initializeDebugControls();
    }
  }

  private initializeDebugControls(): void {
    // Initialize keyboard controls for debug movement
    this.keys = {
      W: this.scene?.input?.keyboard?.addKey("W"),
      A: this.scene?.input?.keyboard?.addKey("A"),
      S: this.scene?.input?.keyboard?.addKey("S"),
      D: this.scene?.input?.keyboard?.addKey("D"),
      Q: this.scene?.input?.keyboard?.addKey("Q"),
      E: this.scene?.input?.keyboard?.addKey("E"),
      F1: this.scene?.input?.keyboard?.addKey("F1"),
    };

    // Set up key event listeners
    this.keys["F1"]?.on("down", () => {
      this.toggleDebugMode();
    });
  }

  update(_: number, delta: number): void {
    if (!this.isEnabled) return;
    this.handleDebugMovement(delta);
  }

  private handleDebugMovement(delta: number): void {
    const debugMoveSpeed = gameConfig.debugMovementSpeed;
    const rotationSpeed = gameConfig.rotationSpeed;
    const deltaSeconds = delta / 1000;

    // WASD movement for position marker
    if (this.keys["W"]?.isDown) {
      const currentPos = this.positionMarker.getPosition();
      const newY = currentPos.y - debugMoveSpeed * deltaSeconds;
      this.positionMarker.setPosition(currentPos.x, newY);
    }
    if (this.keys["S"]?.isDown) {
      const currentPos = this.positionMarker.getPosition();
      const newY = currentPos.y + debugMoveSpeed * deltaSeconds;
      this.positionMarker.setPosition(currentPos.x, newY);
    }
    if (this.keys["A"]?.isDown) {
      const currentPos = this.positionMarker.getPosition();
      const newX = currentPos.x - debugMoveSpeed * deltaSeconds;
      this.positionMarker.setPosition(newX, currentPos.y);
    }
    if (this.keys["D"]?.isDown) {
      const currentPos = this.positionMarker.getPosition();
      const newX = currentPos.x + debugMoveSpeed * deltaSeconds;
      this.positionMarker.setPosition(newX, currentPos.y);
    }

    // QE rotation for camera
    if (this.cameraSystem) {
      if (this.keys["Q"]?.isDown) {
        const currentRotation = this.cameraSystem.getRotation();
        this.cameraSystem.setTargetRotation(
          currentRotation - rotationSpeed * deltaSeconds
        );
      }
      if (this.keys["E"]?.isDown) {
        const currentRotation = this.cameraSystem.getRotation();
        this.cameraSystem.setTargetRotation(
          currentRotation + rotationSpeed * deltaSeconds
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
