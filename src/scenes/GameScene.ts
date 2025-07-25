import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { BaseEnemy } from "../entities/BaseEnemy";
import { PositionMarker } from "../entities/PositionMarker";
import { WalkingEnemiesGroup } from "../entities/WalkingEnemiesGroup";
import { Projectile } from "../entities/Projectile";

import { GridSystem } from "../systems/GridSystem";
import { FollowCamera } from "../systems/FollowCamera";
import { UIScene } from "../scenes/UIScene";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";
import { SpawnService } from "../utils/SpawnService";
import { HexagonCoord } from "../utils/HexagonUtils";
import { PickableItem } from "../entities/PickableItem";
import { DebugLogger } from "../utils/DebugLogger";
import { GameLogic } from "../utils/GameLogic";
import { EnemyVehicleGroup } from "../entities/EnemyVehicleGroup";
import { MovingAgent } from "../entities/MovingAgent";
import { WaveManager } from "../utils/WaveManager";
import { Sapling } from "../entities/Sapling";

export class GameScene extends Phaser.Scene {
  character: Character | undefined;
  positionMarker: PositionMarker | undefined;
  zombieGroup: WalkingEnemiesGroup | undefined;
  zombieVehicleGroup: EnemyVehicleGroup | undefined;
  projectiles: Projectile[] = [];
  saplings: Sapling[] = [];
  spawnService: SpawnService | undefined;
  pickableItems: PickableItem[] = [];
  followCamera: FollowCamera | undefined;
  tileSprite: Phaser.GameObjects.TileSprite | undefined;
  gridSystem: GridSystem | undefined;
  uiScene: UIScene | undefined;
  waveManger: WaveManager;
  private geolocationService: GeolocationService | undefined;
  private compassService: CompassService | undefined;

  constructor() {
    super({ key: "GameScene" });
    this.waveManger = new WaveManager(this);
  }

  async create(data?: {
    geolocationService?: GeolocationService;
    compassService?: CompassService;
  }): Promise<void> {
    this.waveManger.reset();
    this.waveManger.onWaveStart = (waveIndex: number, waveSeconds: number) => {
      console.log("start", waveIndex, waveSeconds);
    };
    this.waveManger.onWaveEnd = (waveIndex: number, gapSeconds: number) => {
      console.log("end", waveIndex, gapSeconds);
    };

    // Clean up any existing state first
    this.cleanupEntities();
    this.cleanupSystems();
    this.cleanupEventListeners();
    this.resetState();

    // Start the UI scene if it's not already running
    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    // Get reference to UI scene
    this.uiScene = this.scene.get("UIScene") as UIScene;

    // Set up debug logger with UI scene
    DebugLogger.getInstance().setUIScene(this.uiScene);

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
    this.setupEventListeners();
    this.initializeSystems();
    this.setupInput();

    // Set up debug toggle callback
    if (this.uiScene) {
      // Set up weapon switch callback
      this.uiScene.setWeaponSwitchCallback(() => {
        if (!this.character) return;

        this.character.getWeaponInventory().cycleToNextWeapon();
        // Update UI immediately after switching
        const currentWeapon = this.character
          .getWeaponInventory()
          .getCurrentWeapon();
        const weaponInventory = this.character.getWeaponInventory();
        this.uiScene?.updateWeaponInfo(
          currentWeapon.getWeaponName(),
          weaponInventory.getAmmo()
        );
      });
    }
  }

  override update(time: number, delta: number): void {
    if (
      !this.character ||
      !this.positionMarker ||
      !this.zombieGroup ||
      !this.zombieVehicleGroup ||
      !this.spawnService ||
      !this.gridSystem ||
      !this.followCamera
    )
      return;

    this.waveManger.update(delta);
    // Update character behaviors
    const markerPos = this.positionMarker.getPosition();
    this.character.moveTarget.set(markerPos.x, markerPos.y);
    this.character.update(time, delta);

    // Update zombie behaviors
    this.zombieGroup.update(time, delta);
    this.zombieGroup.setAllTargets(this.character);

    // Update zombie vehicle behaviors
    this.zombieVehicleGroup.update(time, delta);
    this.zombieVehicleGroup.setAllTargets(this.character);

    this.saplings.forEach((sapling) => sapling.update(delta));

    // Update projectiles using GameLogic
    this.projectiles = GameLogic.updateProjectiles(
      this.projectiles,
      this.time.now
    );

    // Check projectile collisions using GameLogic
    GameLogic.checkProjectileCollisions(
      this.projectiles,
      this.zombieGroup.getEntities(),
      gameConfig.projectilePushbackForce,
      this
    );

    // Check tractor collision using GameLogic
    this.zombieVehicleGroup.checkCollisions([
      this.character,
      ...(this.zombieGroup.getChildren() as MovingAgent[]),
    ]);

    // Check pickups using GameLogic
    this.pickableItems = GameLogic.checkAllPickups(
      this.pickableItems,
      this.character,
      this,
      this.spawnService
    );

    // Update spawn service for respawns
    this.spawnService.update(this.character.x, this.character.y);

    // Update all systems
    this.gridSystem.update();
    this.followCamera.update(time, delta);

    this.updateUI();

    // Handle continuous firing
    this.handleContinuousFiring();

    if (this.tileSprite) {
      const tileSize = 128;
      const tileX = Math.round(this.character.x / tileSize) * tileSize;
      const tileY = Math.round(this.character.y / tileSize) * tileSize;
      this.tileSprite.x = tileX;
      this.tileSprite.y = tileY;
    }
  }

  private async initializeGeolocation(): Promise<void> {
    if (!this.geolocationService) return;

    try {
      // Start location tracking
      this.geolocationService.startLocationTracking(
        (xMeters: number, yMeters: number) => {
          // Update position marker
          if (this.positionMarker) {
            this.positionMarker.setPosition(
              xMeters * gameConfig.geoPixelsPerMeter,
              yMeters * gameConfig.geoPixelsPerMeter
            );
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
        if (!this.followCamera || !this.character) return;
        // Convert degrees to radians
        const radians = (direction * Math.PI) / 180;

        // Apply compass direction to camera rotation
        this.followCamera.setTargetRotation(-radians);
        this.character.setRotation(radians - Math.PI * 0.5);
      });
    } catch (error) {
      console.error("Failed to initialize compass for game scene:", error);
    }
  }

  private updateUI(): void {
    if (!this.uiScene) return;

    // Update weapon info
    if (this.character) {
      const currentWeapon = this.character
        .getWeaponInventory()
        .getCurrentWeapon();
      const weaponInventory = this.character.getWeaponInventory();
      this.uiScene.updateWeaponInfo(
        currentWeapon.getWeaponName(),
        weaponInventory.getAmmo()
      );

      // Update health display
      this.uiScene.updateHealthDisplay(
        this.character.getHealth(),
        this.character.getMaxHealth()
      );
    }
  }

  private setupWorld(): void {
    // Set world bounds (optional - for infinite world)
    this.physics.world.setBounds(-10000, -10000, 20000, 20000);

    // Set background color
    // this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    const screenSize = Math.max(innerHeight, innerWidth) * 2 + 128 * 2;
    this.tileSprite = this.add.tileSprite(
      0,
      0,
      screenSize,
      screenSize,
      "field-tile"
    );
    this.tileSprite.scale = 0.5;
  }

  private createEntities(): void {
    // Create position marker using the PositionMarker entity class
    this.positionMarker = new PositionMarker(
      this,
      gameConfig.world.startLocation.x,
      gameConfig.world.startLocation.y
    );

    // Create character using the Character entity class
    this.character = new Character(
      this,
      gameConfig.world.startLocation.x,
      gameConfig.world.startLocation.y
    );

    // Create zombie group
    this.zombieGroup = new WalkingEnemiesGroup(this);

    // Create zombie vehicle group
    this.zombieVehicleGroup = new EnemyVehicleGroup(this);

    // Add a zombie vehicle to the group
    // this.zombieVehicleGroup.addZombieVehicle(
    //   gameConfig.world.startLocation.x - 250,
    //   gameConfig.world.startLocation.y - 100
    // );

    // Set all zombies to follow the player
    if (this.character) {
      this.zombieGroup.setAllTargets(this.character);
    }

    if (this.zombieGroup) {
      this.spawnService = new SpawnService(this.zombieGroup, this);
    }

    // Set up collision detection
    this.setupCollisions();
  }

  private initializeSystems(): void {
    // Initialize grid system
    if (this.character) {
      this.gridSystem = new GridSystem(this, this.character);
    }

    // Initialize camera system
    if (this.character) {
      this.followCamera = new FollowCamera(this, this.character);
    }
  }

  private setupCollisions(): void {
    if (!this.character || !this.zombieGroup) return;

    // Set up melee attack event listener for the scene
    this.events.on(
      "zombieMeleeAttack",
      (zombie: BaseEnemy) => GameLogic.handleZombieMeleeAttack(zombie, this),
      this
    );
  }

  tearDown(): void {
    this.cleanupEntities();
    this.cleanupSystems();
    this.cleanupEventListeners();
    this.resetState();
  }

  private cleanupEntities(): void {
    // Clean up character
    if (this.character) {
      this.character.destroy();
      this.character = undefined;
    }

    // Clean up position marker
    if (this.positionMarker) {
      this.positionMarker.destroy();
      this.positionMarker = undefined;
    }

    // Clean up zombie group
    if (this.zombieGroup) {
      this.zombieGroup.clear(true, true);
      this.zombieGroup = undefined;
    }

    // Clean up projectiles
    this.projectiles.forEach((projectile) => {
      if (projectile && projectile.active) {
        projectile.destroy();
      }
    });
    this.projectiles = [];

    this.pickableItems.forEach((item) => {
      if (item && item.isActive()) {
        item.destroy();
      }
    });
    this.pickableItems = [];
  }

  private cleanupSystems(): void {
    // Clean up grid system - no destroy method needed
    this.gridSystem = undefined;

    // Clean up camera system - no destroy method needed
    this.followCamera = undefined;

    // Clean up spawn service
    this.spawnService = undefined;
  }

  private cleanupEventListeners(): void {
    // Remove all event listeners
    this.events.off("zombieDied");
    this.events.off("cogwheelPickedUp");
    this.events.off("playerDied");
    this.events.off("hexDiscovered");
    this.events.off("zombieMeleeAttack");
  }

  private resetState(): void {
    // Reset all state variables
    this.uiScene = undefined;
  }

  private handleContinuousFiring(): void {
    if (!this.character || !this.uiScene) return;

    // Check if shooting button is being held down
    if (this.uiScene.isShootingActive()) {
      const rotation = this.character.rotation;
      const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };

      // Use the new weapon system and check if it actually fired
      const didFire = this.character.shoot(this, direction, this.time.now);

      // Only add screen shake if the weapon actually fired
      if (didFire) {
        const currentWeapon = this.character
          .getWeaponInventory()
          .getCurrentWeapon();
        this.cameras.main.shake(
          currentWeapon.getShakeDuration(),
          currentWeapon.getShakeIntensity()
        );
      }
    }
  }

  private setupEventListeners(): void {
    // Set up zombie death event listener
    this.events.on("zombieDied", (zombie: BaseEnemy) => {
      // Notify spawn service about zombie death for hex respawn
      if (this.spawnService) {
        this.spawnService.onZombieKilled(zombie);
      }
    });

    this.events.on("cogwheelPickedUp", () => {
      // TODO: Add cogwheel to inventory
    });

    // Set up player death event listener
    this.events.on("playerDied", () => {
      this.scene.stop("UIScene");
      this.tearDown();

      // Transition to lobby with game over state
      this.scene.start("LobbyScene", {
        geolocationService: this.geolocationService,
        compassService: this.compassService,
        isGameOver: true,
      });
    });

    // Set up event listeners for hex discovery
    this.events.on("hexDiscovered", (hex: HexagonCoord) => {
      if (this.spawnService) {
        // Calculate distance from player to hex center
        this.spawnService.handleHexDiscovered(hex);
      }
    });
  }

  private setupInput(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.positionMarker) {
        this.positionMarker.setPosition(pointer.worldX, pointer.worldY);
      }
    });
  }
}
