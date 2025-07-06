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

import compassUrl from "../assets/compass.png";
import debugCompassSquare from "../assets/debug-compass-square.png";
import debugCompassCircle from "../assets/debug-compass-circle.png";

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
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    this.load.image("character", compassUrl);
    this.load.image("compass-square", debugCompassSquare);
    this.load.image("compass-circle", debugCompassCircle);
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
          // Convert meters to pixels (coordinates are already in meters with Y-axis inversion)
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
          this.systems.camera.setTargetRotation(-radians);
        }
        if (this.character) {
          this.character.setRotation(radians);
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
      this.systems.grid = new GridSystem(this, this.character, (_) => {
        // Here's where we would populate the hexagon, replace _ with hex
        // const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);
        // console.log("Populating hexagon:", hex, worldPos);
      });
    }

    // Initialize camera system
    if (this.character) {
      this.systems.camera = new CameraSystem(this, this.character);
    }

    // Initialize debug system
    if (this.character && this.positionMarker && gameConfig.devMode) {
      this.systems.debug = new DebugSystem(
        this,
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
}
