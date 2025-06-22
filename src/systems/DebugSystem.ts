import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { CameraSystem } from "./CameraSystem";

export class DebugSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private positionMarker: PositionMarker;
  private cameraSystem: CameraSystem | undefined;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key | undefined } = {};
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private isEnabled: boolean;

  constructor(
    scene: Phaser.Scene,
    character: Character,
    positionMarker: PositionMarker,
    cameraSystem?: CameraSystem
  ) {
    this.scene = scene;
    this.character = character;
    this.positionMarker = positionMarker;
    this.cameraSystem = cameraSystem || undefined;
    this.isEnabled = gameConfig.devMode;

    if (this.isEnabled) {
      this.initializeDebugControls();
      this.createDebugGraphics();
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

  private createDebugGraphics(): void {
    // Create debug graphics for drawing debug info
    this.debugGraphics = this.scene.add.graphics();
  }

  update(_: number, delta: number): void {
    if (!this.isEnabled) return;
    this.handleDebugMovement(delta);
    this.updateDebugVisualization();
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

  private updateDebugVisualization(): void {
    if (!this.debugGraphics) return;

    this.debugGraphics.clear();

    // Draw debug info around character
    const characterPos = this.character.getPosition();
    this.debugGraphics.lineStyle(2, 0xff0000, 0.8);
    this.debugGraphics.strokeCircle(characterPos.x, characterPos.y, 20);

    // Draw debug info around position marker
    const markerPos = this.positionMarker.getPosition();
    this.debugGraphics.lineStyle(2, 0x00ff00, 0.8);
    this.debugGraphics.strokeCircle(markerPos.x, markerPos.y, 15);

    // Draw line between character and marker
    this.debugGraphics.lineStyle(1, 0xffff00, 0.5);
    this.debugGraphics.beginPath();
    this.debugGraphics.moveTo(characterPos.x, characterPos.y);
    this.debugGraphics.lineTo(markerPos.x, markerPos.y);
    this.debugGraphics.strokePath();
  }

  private toggleDebugMode(): void {
    this.isEnabled = !this.isEnabled;

    if (this.debugGraphics) {
      this.debugGraphics.setVisible(this.isEnabled);
    }
  }

  // Public methods for external control
  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  setDebugEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (this.debugGraphics) {
      this.debugGraphics.setVisible(enabled);
    }
  }

  // Method to clear debug graphics
  clearDebugGraphics(): void {
    if (this.debugGraphics) {
      this.debugGraphics.clear();
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
  }
}
