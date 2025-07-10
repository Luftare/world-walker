import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { ZombieGroup } from "../entities/ZombieGroup";
import { ZombieSpawnPoint } from "../entities/ZombieSpawnPoint";
import { Projectile } from "../entities/Projectile";
import { GridSystem } from "../systems/GridSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { DebugSystem } from "../systems/DebugSystem";
import { UIScene } from "../scenes/UIScene";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";

import compassUrl from "../assets/compass.png";
import debugCompassSquare from "../assets/debug-compass-square.png";
import debugCompassCircle from "../assets/debug-compass-circle.png";
import debugZombie from "../assets/debug-zombie.png";
import { HexagonUtils } from "../utils/HexagonUtils";

export class GameScene extends Phaser.Scene {
  private character?: Character;
  private positionMarker?: PositionMarker;
  private zombieGroup?: ZombieGroup;
  private zombieSpawnPoints: ZombieSpawnPoint[] = [];
  private systems: {
    grid?: GridSystem;
    camera?: CameraSystem;
    debug?: DebugSystem;
  } = {};
  private uiScene?: UIScene;
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;
  private projectiles: Projectile[] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    this.load.image("character", compassUrl);
    this.load.image("compass-square", debugCompassSquare);
    this.load.image("compass-circle", debugCompassCircle);
    this.load.image("zombie", debugZombie);
    this.load.image("projectile", debugCompassCircle); // Using same texture for now
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

      // Set up shoot callback
      this.uiScene.setShootCallback(() => {
        this.handleShoot();
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
          this.character.setRotation(radians - Math.PI * 0.5);
        }
      });
    } catch (error) {
      console.error("Failed to initialize compass for game scene:", error);
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

    // Update zombie spawn points
    this.zombieSpawnPoints.forEach((spawnPoint) => {
      spawnPoint.update(time);
    });

    // Update projectiles
    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile.active) return false;
      projectile.update(this.time.now);
      return projectile.active;
    });

    // Check for projectile-zombie collisions
    this.checkProjectileCollisions();

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

    // Update weapon info
    if (this.character) {
      const currentWeapon = this.character
        .getWeaponInventory()
        .getCurrentWeapon();
      this.uiScene.updateWeaponInfo(
        currentWeapon.getWeaponName(),
        currentWeapon.getAmmo()
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
      gameConfig.world.startLocation.y,
      "compass-circle"
    );

    // Create zombie group
    this.zombieGroup = new ZombieGroup(this);

    // Create zombie spawn point at position (200, 200)
    this.zombieSpawnPoints.push(
      new ZombieSpawnPoint(
        this,
        50 * gameConfig.scale,
        50 * gameConfig.scale,
        gameConfig.hexagonRadius * gameConfig.scale * 2, // spawn radius
        4000,
        this.zombieGroup
      )
    );

    this.zombieSpawnPoints.push(
      new ZombieSpawnPoint(
        this,
        -50 * gameConfig.scale,
        -50 * gameConfig.scale,
        gameConfig.hexagonRadius * gameConfig.scale * 2, // spawn radius
        4000,
        this.zombieGroup
      )
    );

    this.zombieSpawnPoints.push(
      new ZombieSpawnPoint(
        this,
        50 * gameConfig.scale,
        -50 * gameConfig.scale,
        gameConfig.hexagonRadius * gameConfig.scale * 2, // spawn radius
        4000,
        this.zombieGroup
      )
    );

    this.zombieSpawnPoints.push(
      new ZombieSpawnPoint(
        this,
        -50 * gameConfig.scale,
        50 * gameConfig.scale,
        gameConfig.hexagonRadius * gameConfig.scale * 2, // spawn radius
        4000,
        this.zombieGroup
      )
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
      this.systems.grid = new GridSystem(this, this.character, (hex) => {
        // Here's where we would populate the hexagon, replace _ with hex
        if (!this.zombieGroup || !this.character) return;
        if (Math.random() > 0.5) return;
        const worldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);
        this.zombieGroup.addZombie(worldPos.x, worldPos.y);
        this.zombieGroup.setAllTargets(this.character);
      });
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

    // We'll handle collision detection in the update loop
    // since we need to check projectiles dynamically
  }

  private checkProjectileCollisions(): void {
    if (!this.zombieGroup) return;
    const zombies = this.zombieGroup.getZombies();
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      for (const zombie of zombies) {
        if (!zombie.active || zombie.getIsDead()) continue;
        const distance = Phaser.Math.Distance.Between(
          projectile.x,
          projectile.y,
          zombie.x,
          zombie.y
        );
        const collisionRadius = 20;
        if (distance < collisionRadius) {
          // Apply pushback in the direction of the projectile
          const projectileDirection = projectile.getDirection();
          zombie.takeDamage(1, projectileDirection);
          zombie.applyPushback(projectileDirection, 40 * gameConfig.scale);
          projectile.destroy();
          break;
        }
      }
    }
  }

  private handleShoot(): void {
    if (!this.character) return;

    const rotation = this.character.rotation;
    const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };

    // Use the new weapon system
    this.character.shoot(this, direction, this.time.now);

    // Add screen shake effect
    this.cameras.main.shake(100, 0.003);
  }

  private setupInput(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.positionMarker && this.systems.debug?.isDebugEnabled()) {
        this.positionMarker.setPosition(pointer.worldX, pointer.worldY);
      }
    });
  }
}
