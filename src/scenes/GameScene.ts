import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { MovementSystem } from "../systems/MovementSystem";
import { GridSystem } from "../systems/GridSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { DebugSystem } from "../systems/DebugSystem";
import { UIScene } from "../scenes/UIScene";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";

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
  private lastSaveTime: number = 0;
  private saveInterval: number = 30000; // Save every 30 seconds
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    // Preload any assets here
  }

  async create(data?: {
    geolocationService?: GeolocationService;
    compassService?: CompassService;
  }): Promise<void> {
    // Start the UI scene if it's not already running
    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    // Get reference to UI scene
    this.uiScene = this.scene.get("UIScene") as UIScene;

    // Initialize services from menu scene
    if (data?.geolocationService) {
      this.geolocationService = data.geolocationService;
      await this.initializeGeolocation();
    }

    if (data?.compassService) {
      this.compassService = data.compassService;
      await this.initializeCompass();
    }

    this.setupWorld();
    this.createEntities();
    this.initializeSystems();
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

  private async initializeGeolocation(): Promise<void> {
    if (!this.geolocationService) return;

    try {
      // Start location tracking
      this.geolocationService.startLocationTracking(
        (x: number, y: number) => {
          if (this.systems.debug?.isDebugEnabled()) {
            return;
          }
          // Convert meters to pixels
          const xPixels = x * gameConfig.scale;
          const yPixels = y * gameConfig.scale;

          // Update position marker
          if (this.positionMarker) {
            this.positionMarker.setPosition(xPixels, yPixels);
          }
        },
        (error: string) => {
          console.error("Geolocation error:", error);
        }
      );
    } catch (error) {
      console.error("Failed to start geolocation tracking:", error);
    }
  }

  private async initializeCompass(): Promise<void> {
    if (!this.compassService) return;

    try {
      // Update the compass heading callback for the game scene
      // Tracking is already started in the menu scene to maintain the user gesture call chain
      this.compassService.startCompassTracking((direction: number) => {
        if (this.systems.debug?.isDebugEnabled()) {
          return;
        }
        // Convert degrees to radians
        const radians = (direction * Math.PI) / 180;

        // Apply compass direction to camera rotation
        if (this.systems.camera) {
          this.systems.camera.setTargetRotation(Math.PI * 0.5 - radians);
        }
      });
    } catch (error) {
      console.error("Failed to initialize compass for game scene:", error);
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

    this.updateUI();
  }

  private updateUI(): void {
    if (!this.uiScene) return;

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
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.positionMarker && this.systems.debug?.isDebugEnabled()) {
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

  getCameraSystem(): CameraSystem | undefined {
    return this.systems.camera;
  }

  // Grid persistence methods
  saveGridData(): void {
    this.systems.grid?.saveGridData();
  }

  clearGridData(): void {
    this.systems.grid?.clearGridData();
  }
}
