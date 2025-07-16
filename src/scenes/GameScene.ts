import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { BaseEnemy } from "../entities/BaseEnemy";
import { PositionMarker } from "../entities/PositionMarker";
import { ZombieGroup } from "../entities/ZombieGroup";
import { WalkingZombie } from "../entities/WalkingZombie";
import { Projectile } from "../entities/Projectile";

import { GridSystem } from "../systems/GridSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { DebugSystem } from "../systems/DebugSystem";
import { UIScene } from "../scenes/UIScene";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";
import { SpawnService } from "../utils/SpawnService";
import { HexagonCoord } from "../utils/HexagonUtils";
import { PickableItem } from "../entities/PickableItem";
import { DebugLogger } from "../utils/DebugLogger";
import { GameLogic } from "../utils/GameLogic";
import { ZombieVehicleGroup } from "../entities/ZombieVehicleGroup";

export class GameScene extends Phaser.Scene {
  character: Character | undefined;
  positionMarker: PositionMarker | undefined;
  zombieGroup: ZombieGroup | undefined;
  zombieVehicleGroup: ZombieVehicleGroup | undefined;
  projectiles: Projectile[] = [];
  spawnService: SpawnService | undefined;
  pickableItems: PickableItem[] = [];
  systems: {
    grid: GridSystem | undefined;
    camera: CameraSystem | undefined;
    debug: DebugSystem | undefined;
  } = {
    grid: undefined,
    camera: undefined,
    debug: undefined,
  };
  uiScene: UIScene | undefined;
  private geolocationService: GeolocationService | undefined;
  private compassService: CompassService | undefined;

  constructor() {
    super({ key: "GameScene" });
  }

  async create(data?: {
    geolocationService?: GeolocationService;
    compassService?: CompassService;
  }): Promise<void> {
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
    this.setupHexEventListeners();
    this.setupEventListeners();
    this.initializeSystems();
    this.setupInput();

    // Set up debug toggle callback
    if (this.uiScene) {
      // Set up weapon switch callback
      this.uiScene.setWeaponSwitchCallback(() => {
        if (this.character) {
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
        }
      });
    }
  }

  override update(time: number, delta: number): void {
    // Update character behaviors
    if (this.character && this.positionMarker) {
      const markerPos = this.positionMarker.getPosition();
      this.character.setMovementTarget(markerPos.x, markerPos.y);
      this.character.update(time, delta);
    }

    // Update zombie behaviors
    if (this.zombieGroup) {
      this.zombieGroup.update(time, delta);
      if (this.character) {
        this.zombieGroup.setAllTargets(this.character);
      }
    }

    // Update zombie vehicle behaviors
    if (this.zombieVehicleGroup) {
      this.zombieVehicleGroup.update(time, delta);
      if (this.character) {
        this.zombieVehicleGroup.setAllTargets(this.character);
      }
    }

    // Update projectiles using GameLogic
    this.projectiles = GameLogic.updateProjectiles(
      this.projectiles,
      this.time.now
    );

    // Check projectile collisions using GameLogic
    if (this.zombieGroup) {
      GameLogic.checkProjectileCollisions(
        this.projectiles,
        this.zombieGroup.getZombies(),
        gameConfig.projectilePushbackForce
      );
    }

    // Check tractor collision using GameLogic
    if (this.zombieVehicleGroup && this.character && this.zombieGroup) {
      this.zombieVehicleGroup.checkCollisions([
        this.character,
        ...(this.zombieGroup.getChildren() as WalkingZombie[]),
      ]);
    }

    // Check pickups using GameLogic
    if (this.character) {
      this.pickableItems = GameLogic.checkAllPickups(
        this.pickableItems,
        this.character,
        this.spawnService
      );
    }

    // Update spawn service for respawns
    if (this.spawnService && this.character) {
      this.spawnService.update(this.character.x, this.character.y);
    }

    // Update all systems
    Object.values(this.systems).forEach((system) => {
      if (system && typeof system.update === "function") {
        system.update(time, delta);
      }
    });

    this.updateUI();

    // Handle continuous firing
    this.handleContinuousFiring();
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
        if (!this.systems.camera || !this.character) return;
        // Convert degrees to radians
        const radians = (direction * Math.PI) / 180;

        // Apply compass direction to camera rotation
        this.systems.camera.setTargetRotation(-radians);
        this.character.setRotation(radians - Math.PI * 0.5);

        // Find all pickable items and update their rotation
        this.children.list.forEach((child) => {
          if (child instanceof PickableItem) {
            child.spriteRotation = radians;
          }
        });
      });
    } catch (error) {
      console.error("Failed to initialize compass for game scene:", error);
    }
  }

  private updateUI(): void {
    if (!this.uiScene) return;

    const isDebugEnabled = this.systems.debug?.isDebugEnabled() || false;
    this.uiScene.updateDebugButtonText(isDebugEnabled);

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
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
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
    this.zombieGroup = new ZombieGroup(this);

    // Create zombie vehicle group
    this.zombieVehicleGroup = new ZombieVehicleGroup(this);

    // Add a zombie vehicle to the group
    this.zombieVehicleGroup.addZombieVehicle(
      gameConfig.world.startLocation.x - 250,
      gameConfig.world.startLocation.y - 100
    );

    // Set all zombies to follow the player
    if (this.character) {
      this.zombieGroup.setAllTargets(this.character);
    }

    // Set up collision detection
    this.setupCollisions();
  }

  private initializeSystems(): void {
    // Initialize grid system
    if (this.character) {
      this.systems.grid = new GridSystem(this, this.character);
    }

    // Initialize camera system
    if (this.character) {
      this.systems.camera = new CameraSystem(this, this.character);
    }

    // Initialize debug system
    if (this.character && this.positionMarker) {
      this.systems.debug = new DebugSystem(
        this,
        this.character,
        this.systems.camera
      );
    }
  }

  private setupCollisions(): void {
    if (!this.character || !this.zombieGroup) return;

    // Set up melee attack event listener for the scene
    this.events.on("zombieMeleeAttack", this.handleZombieMeleeAttack, this);
  }

  private handleZombieMeleeAttack(zombie: WalkingZombie): void {
    if (!this.character || this.character.getIsDead()) return;

    // Check if zombie is actually in attack range
    if (!zombie.isInAttackRange()) return;

    // Deal damage to player
    this.character.takeDamage(1);

    // Apply pushback to the character
    const impulse = new Phaser.Math.Vector2(
      this.character.x - zombie.x,
      this.character.y - zombie.y
    )
      .normalize()
      .scale(400);
    this.character.applyPushback(impulse);

    // Add screen shake for feedback
    this.cameras.main.shake(100, 0.002);

    // Create hit effect on player
    this.createPlayerHitEffect();
  }

  private createPlayerHitEffect(): void {
    if (!this.character) return;

    // Create a red flash effect on the player
    this.character.setTint(0xff0000);

    this.tweens.add({
      targets: this.character,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.character?.clearTint(); // Always clear tint to ensure it returns to normal
      },
    });
  }

  private handleZombieDeath(x: number, y: number, zombie: BaseEnemy): void {
    // Notify spawn service about zombie death for hex respawn
    if (this.spawnService) {
      this.spawnService.onZombieKilled(zombie);
    }

    // Spawn loot using GameLogic
    GameLogic.spawnLootFromZombie(x, y, this, this.pickableItems);
  }

  private handlePlayerDeath(): void {
    // Stop the UI scene
    this.scene.stop("UIScene");
    this.tearDown();

    // Transition to lobby with game over state
    this.scene.start("LobbyScene", {
      geolocationService: this.geolocationService,
      compassService: this.compassService,
      isGameOver: true,
    });
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
    this.systems.grid = undefined;

    // Clean up camera system - no destroy method needed
    this.systems.camera = undefined;

    // Clean up debug system
    if (this.systems.debug) {
      if (typeof this.systems.debug.destroy === "function") {
        this.systems.debug.destroy();
      }
      this.systems.debug = undefined;
    }

    // Clean up spawn service
    this.spawnService = undefined;
  }

  private cleanupEventListeners(): void {
    // Remove all event listeners
    this.events.off("zombieDied");
    this.events.off("coinPickedUp");
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
    this.events.on("zombieDied", (x: number, y: number, zombie: BaseEnemy) => {
      this.handleZombieDeath(x, y, zombie);
    });

    // Set up coin pickup event listener
    this.events.on("coinPickedUp", () => {
      if (this.uiScene) {
        this.uiScene.addCoin();
      }
    });

    // Set up player death event listener
    this.events.on("playerDied", () => {
      this.handlePlayerDeath();
    });
  }

  private setupHexEventListeners(): void {
    // Initialize spawn service first
    if (this.zombieGroup) {
      this.spawnService = new SpawnService(this.zombieGroup, this);
    }

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
