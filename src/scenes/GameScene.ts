import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { MovementSystem } from "../systems/MovementSystem";
import { GridSystem } from "../systems/GridSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { DebugSystem } from "../systems/DebugSystem";
import { UIScene } from "../scenes/UIScene";

export class GameScene extends Phaser.Scene {
  private character?: Character;
  private positionMarker?: PositionMarker;
  private systems: {
    movement?: MovementSystem;
    grid?: GridSystem;
    camera?: CameraSystem;
    debug?: DebugSystem;
  } = {};
  private uiScene?: UIScene;
  private score: number = 0;
  private lastSaveTime: number = 0;
  private saveInterval: number = 30000; // Save every 30 seconds

  constructor() {
    super({ key: "GameScene" });
  }

  override preload(): void {
    // Preload any assets here
  }

  override create(): void {
    // Start the UI scene if it's not already running
    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    // Get reference to UI scene
    this.uiScene = this.scene.get("UIScene") as UIScene;

    // Set up the game world
    this.setupWorld();

    // Create initial game entities
    this.createEntities();

    // Initialize game systems
    this.initializeSystems();

    // Set up input handling
    this.setupInput();

    // Set up debug toggle callback
    if (this.uiScene) {
      this.uiScene.setDebugToggleCallback(() => {
        if (this.systems.debug) {
          const newState = !this.systems.debug.isDebugEnabled();
          this.systems.debug.setDebugEnabled(newState);
          this.uiScene?.updateDebugButtonText(newState);
        }
      });
    }
  }

  override update(time: number, delta: number): void {
    // Update all systems
    Object.values(this.systems).forEach((system) => {
      if (system && typeof system.update === "function") {
        system.update(time, delta);
      }
    });

    // Update feature rotations to counter camera rotation
    if (this.systems.camera && this.systems.grid) {
      const cameraRotation = this.systems.camera.getRotation();
      this.systems.grid.updateFeatureRotations(cameraRotation);
    }

    // Periodic grid data saving
    if (this.systems.grid && time - this.lastSaveTime > this.saveInterval) {
      this.systems.grid.saveGridData();
      this.lastSaveTime = time;
    }

    // Update UI with debug info
    this.updateUI();
  }

  private updateUI(): void {
    if (!this.uiScene) return;

    // Update debug info
    if (this.systems.debug && this.systems.debug.isDebugEnabled()) {
      const character = this.getCharacter();
      const marker = this.getPositionMarker();
      const camera = this.getCameraSystem();

      if (character && marker && camera) {
        const charPos = character.getPosition();
        const markerPos = marker.getPosition();
        const cameraRotation = camera.getRotation();

        const debugInfo = `Character: (${charPos.x.toFixed(
          1
        )}, ${charPos.y.toFixed(1)})
Marker: (${markerPos.x.toFixed(1)}, ${markerPos.y.toFixed(1)})
Camera Rotation: ${((cameraRotation * 180) / Math.PI).toFixed(1)}°`;

        this.uiScene.updateDebugInfo(debugInfo);
      }
    } else {
      this.uiScene.updateDebugInfo("");
    }

    // Update score
    this.uiScene.updateScore(this.score);

    // Update debug button state
    const isDebugEnabled = this.systems.debug?.isDebugEnabled() || false;
    this.uiScene.updateDebugButtonText(isDebugEnabled);
  }

  private setupWorld(): void {
    // Set world bounds (optional - for infinite world)
    this.physics.world.setBounds(-10000, -10000, 20000, 20000);

    // Set background color
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
  }

  private createEntities(): void {
    // Create character using the Character entity class
    this.character = new Character(
      this,
      gameConfig.world.startLocation.x,
      gameConfig.world.startLocation.y
    );

    // Create position marker using the PositionMarker entity class
    this.positionMarker = new PositionMarker(
      this,
      gameConfig.world.startLocation.x,
      gameConfig.world.startLocation.y
    );
  }

  private initializeSystems(): void {
    // Initialize movement system
    if (this.character && this.positionMarker) {
      this.systems.movement = new MovementSystem(
        this.character,
        this.positionMarker
      );
    }

    // Initialize grid system
    if (this.character) {
      this.systems.grid = new GridSystem(this, this.character);
    }

    // Initialize camera system
    if (this.character) {
      this.systems.camera = new CameraSystem(this, this.character);
    }

    // Initialize debug system
    if (this.character && this.positionMarker && gameConfig.devMode) {
      this.systems.debug = new DebugSystem(
        this,
        this.character,
        this.positionMarker,
        this.systems.camera
      );
    }
  }

  private setupInput(): void {
    // Set up input handling for mouse/touch
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.positionMarker) {
        this.positionMarker.setPosition(pointer.worldX, pointer.worldY);
      }
    });
  }

  // Public methods for other systems to access game objects
  getCharacter(): Character | undefined {
    return this.character;
  }

  getPositionMarker(): PositionMarker | undefined {
    return this.positionMarker;
  }

  getGridSystem(): GridSystem | undefined {
    return this.systems.grid;
  }

  getCameraSystem(): CameraSystem | undefined {
    return this.systems.camera;
  }

  getDebugSystem(): DebugSystem | undefined {
    return this.systems.debug;
  }

  // Method to update score (called when collecting features)
  addScore(points: number): void {
    this.score += points;
  }

  getScore(): number {
    return this.score;
  }

  // Grid persistence methods
  saveGridData(): void {
    this.systems.grid?.saveGridData();
  }

  clearGridData(): void {
    this.systems.grid?.clearGridData();
  }
}
