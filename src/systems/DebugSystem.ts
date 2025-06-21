import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { CameraSystem } from "./CameraSystem";

export class DebugSystem {
  private scene: Phaser.Scene;
  private character: Character;
  private positionMarker: PositionMarker;
  private cameraSystem: CameraSystem | undefined;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugText?: Phaser.GameObjects.Text;
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
      this.createDebugUI();
    }
  }

  private initializeDebugControls(): void {
    // Create keyboard keys for WASD movement
    this.keys = {
      W: this.scene.input.keyboard!.addKey("W"),
      A: this.scene.input.keyboard!.addKey("A"),
      S: this.scene.input.keyboard!.addKey("S"),
      D: this.scene.input.keyboard!.addKey("D"),
      Q: this.scene.input.keyboard!.addKey("Q"),
      E: this.scene.input.keyboard!.addKey("E"),
    };

    // Add debug toggle key (F12)
    const debugToggleKey = this.scene.input.keyboard!.addKey("F12");
    debugToggleKey.on("down", () => {
      this.toggleDebugMode();
    });
  }

  private createDebugUI(): void {
    // Create debug graphics for drawing debug info
    this.debugGraphics = this.scene.add.graphics();

    // Create debug text display
    this.debugText = this.scene.add.text(10, 10, "", {
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 },
    });
    this.debugText.setScrollFactor(0); // Keep text fixed to camera
    this.debugText.setDepth(1000); // Ensure it's on top
  }

  update(time: number, delta: number): void {
    if (!this.isEnabled) return;

    this.handleMovementInput(delta);
    this.updateDebugDisplay();
  }

  private handleMovementInput(delta: number): void {
    const markerPos = this.positionMarker.getPosition();
    const moveSpeed = gameConfig.movementSpeed * 2; // Debug movement is faster
    const moveDistance = moveSpeed * (delta / 16); // Normalize to 60fps

    let newX = markerPos.x;
    let newY = markerPos.y;

    // Handle WASD movement for position marker
    if (this.keys["W"] && this.keys["W"].isDown) {
      newY -= moveDistance;
    }
    if (this.keys["S"] && this.keys["S"].isDown) {
      newY += moveDistance;
    }
    if (this.keys["A"] && this.keys["A"].isDown) {
      newX -= moveDistance;
    }
    if (this.keys["D"] && this.keys["D"].isDown) {
      newX += moveDistance;
    }

    // Handle QE camera rotation
    if (this.cameraSystem) {
      const rotationSpeed = 0.05;
      let currentRotation = this.cameraSystem.getRotation();

      if (this.keys["Q"] && this.keys["Q"].isDown) {
        currentRotation -= rotationSpeed;
        this.cameraSystem.setTargetRotation(currentRotation);
      }
      if (this.keys["E"] && this.keys["E"].isDown) {
        currentRotation += rotationSpeed;
        this.cameraSystem.setTargetRotation(currentRotation);
      }
    }

    // Update position marker if moved
    if (newX !== markerPos.x || newY !== markerPos.y) {
      this.positionMarker.setPosition(newX, newY);
    }
  }

  private updateDebugDisplay(): void {
    if (!this.debugText) return;

    const characterPos = this.character.getPosition();
    const markerPos = this.positionMarker.getPosition();

    // Calculate distance between character and marker
    const distance = Math.sqrt(
      Math.pow(markerPos.x - characterPos.x, 2) +
        Math.pow(markerPos.y - characterPos.y, 2)
    );

    const cameraRotation = this.cameraSystem
      ? this.cameraSystem.getRotation()
      : 0;

    const debugInfo = [
      "DEBUG MODE (F12 to toggle)",
      `Character: (${characterPos.x.toFixed(1)}, ${characterPos.y.toFixed(1)})`,
      `Marker: (${markerPos.x.toFixed(1)}, ${markerPos.y.toFixed(1)})`,
      `Distance: ${distance.toFixed(1)}`,
      `Camera Rotation: ${(cameraRotation * (180 / Math.PI)).toFixed(1)}°`,
      "",
      "Controls:",
      "WASD - Move marker",
      "Q/E - Rotate camera",
    ];

    this.debugText.setText(debugInfo.join("\n"));
  }

  private toggleDebugMode(): void {
    this.isEnabled = !this.isEnabled;

    if (this.debugText) {
      this.debugText.setVisible(this.isEnabled);
    }
    if (this.debugGraphics) {
      this.debugGraphics.setVisible(this.isEnabled);
    }

    console.log(`Debug mode: ${this.isEnabled ? "ON" : "OFF"}`);
  }

  // Public methods for external control
  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  setDebugEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.toggleDebugMode();
  }

  // Method to draw debug information (can be called by other systems)
  drawDebugInfo(
    x: number,
    y: number,
    info: string,
    color: number = 0xff0000
  ): void {
    if (!this.isEnabled || !this.debugGraphics) return;

    this.debugGraphics.fillStyle(color, 0.8);
    this.debugGraphics.fillCircle(x, y, 3);

    // Could add text rendering here if needed
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
    if (this.debugText) {
      this.debugText.destroy();
    }
  }
}
