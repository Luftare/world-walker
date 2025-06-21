import { gameConfig } from "../config/gameConfig";

export class GameScene extends Phaser.Scene {
  private character?: Phaser.GameObjects.Graphics;
  private positionMarker?: Phaser.GameObjects.Graphics;
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
    // Create character (gray circle)
    this.character = this.add.graphics();
    this.character.fillStyle(gameConfig.colors.player);
    this.character.lineStyle(2, gameConfig.colors.playerBorder);
    this.character.fillCircle(0, 0, gameConfig.playerRadius * gameConfig.scale);
    this.character.strokeCircle(
      0,
      0,
      gameConfig.playerRadius * gameConfig.scale
    );

    // Position character at world start location
    this.character.setPosition(
      gameConfig.world.startLocation.x,
      gameConfig.world.startLocation.y
    );

    // Create position marker (semi-transparent blue circle)
    this.positionMarker = this.add.graphics();
    this.positionMarker.fillStyle(
      gameConfig.colors.marker,
      gameConfig.markerAlpha
    );
    this.positionMarker.lineStyle(1, gameConfig.colors.marker);
    this.positionMarker.fillCircle(
      0,
      0,
      gameConfig.markerRadius * gameConfig.scale
    );
    this.positionMarker.strokeCircle(
      0,
      0,
      gameConfig.markerRadius * gameConfig.scale
    );

    // Position marker starts at same location as character
    this.positionMarker.setPosition(
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
  getCharacter(): Phaser.GameObjects.Graphics | undefined {
    return this.character;
  }

  getPositionMarker(): Phaser.GameObjects.Graphics | undefined {
    return this.positionMarker;
  }
}
