import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";

export class GameScene extends Phaser.Scene {
  private character?: Character;
  private positionMarker?: PositionMarker;
  private systems: {
    movement?: any;
    grid?: any;
    camera?: any;
    debug?: any;
  } = {};

  constructor() {
    super({ key: "GameScene" });
  }

  override preload(): void {
    // Preload any assets here
    console.log("GameScene: Preloading assets...");
  }

  override create(): void {
    console.log("GameScene: Creating game objects...");

    // Set up the game world
    this.setupWorld();

    // Initialize game systems
    this.initializeSystems();

    // Create initial game entities
    this.createEntities();

    // Set up input handling
    this.setupInput();

    console.log("GameScene: Setup complete");
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

  private initializeSystems(): void {
    // Initialize game systems here
    // These will be implemented in later tasks
    console.log("GameScene: Initializing systems...");
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

    console.log("GameScene: Entities created");
  }

  private setupInput(): void {
    // Set up input handling for mouse/touch
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.positionMarker) {
        this.positionMarker.setPosition(pointer.worldX, pointer.worldY);
        console.log(
          `Position marker moved to: ${pointer.worldX}, ${pointer.worldY}`
        );
      }
    });

    console.log("GameScene: Input setup complete");
  }

  // Public methods for other systems to access game objects
  getCharacter(): Character | undefined {
    return this.character;
  }

  getPositionMarker(): PositionMarker | undefined {
    return this.positionMarker;
  }
}
