import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { MovementSystem } from "../systems/MovementSystem";

export class GameScene extends Phaser.Scene {
  private character?: Character;
  private positionMarker?: PositionMarker;
  private systems: {
    movement?: MovementSystem;
    grid?: any;
    camera?: any;
    debug?: any;
  } = {};

  constructor() {
    super({ key: "GameScene" });
  }

  override preload(): void {
    // Preload any assets here
  }

  override create(): void {
    // Set up the game world
    this.setupWorld();

    // Create initial game entities
    this.createEntities();

    // Initialize game systems
    this.initializeSystems();

    // Set up input handling
    this.setupInput();
  }

  override update(time: number, delta: number): void {
    // Update all systems
    Object.values(this.systems).forEach((system) => {
      if (system && typeof system.update === "function") {
        system.update(time, delta);
      }
    });
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
}
