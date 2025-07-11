import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { ZombieGroup } from "../entities/ZombieGroup";
import { WalkingZombie } from "../entities/WalkingZombie";
import { Projectile } from "../entities/Projectile";
import { AmmoPack } from "../entities/AmmoPack";
import { Coin } from "../entities/Coin";
import { GridSystem } from "../systems/GridSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { DebugSystem } from "../systems/DebugSystem";
import { UIScene } from "../scenes/UIScene";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";
import { SpawnService } from "../utils/SpawnService";
import { HealthPack } from "../entities/HealthPack";

import compassUrl from "../assets/compass.png";
import ammoPackUrl from "../assets/ammo-pack.png";
import coinUrl from "../assets/coin.png";
import debugCompassSquare from "../assets/debug-compass-square.png";
import debugCompassCircle from "../assets/debug-compass-circle.png";
import debugZombie from "../assets/debug-zombie.png";
import healthPackUrl from "../assets/health-pack.png";
import { HexagonCoord, HexagonUtils } from "../utils/HexagonUtils";
import { PickableItem } from "../entities/PickableItem";

export class GameScene extends Phaser.Scene {
  private character: Character | undefined;
  private positionMarker: PositionMarker | undefined;
  private zombieGroup: ZombieGroup | undefined;
  private systems: {
    grid: GridSystem | undefined;
    camera: CameraSystem | undefined;
    debug: DebugSystem | undefined;
  } = {
    grid: undefined,
    camera: undefined,
    debug: undefined,
  };
  private uiScene: UIScene | undefined;
  private geolocationService: GeolocationService | undefined;
  private compassService: CompassService | undefined;
  private spawnService: SpawnService | undefined;
  private safeStartCounter: number = 3000;
  private projectiles: Projectile[] = [];
  private ammoPacks: AmmoPack[] = [];
  private coins: Coin[] = [];
  private healthPacks: HealthPack[] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    this.load.image("character", compassUrl);
    this.load.image("compass-square", debugCompassSquare);
    this.load.image("compass-circle", debugCompassCircle);
    this.load.image("zombie", debugZombie);
    this.load.image("ammo-pack", ammoPackUrl);
    this.load.image("coin", coinUrl);
    this.load.image("projectile", debugCompassCircle); // Using same texture for now
    this.load.image("health-pack", healthPackUrl);
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
        // Convert degrees to radians
        const radians = (direction * Math.PI) / 180;

        // Apply compass direction to camera rotation
        if (this.systems.camera) {
          this.systems.camera.setTargetRotation(-radians);
        }

        if (this.character) {
          this.character.setRotation(radians - Math.PI * 0.5);
        }

        // Find all pickable items and update their rotation
        this.children.list.forEach((child) => {
          if (child instanceof PickableItem) {
            child.spriteRotation = radians;
          }
        });

        // DEBUG: Update compass buffer visualization
        this.updateCompassBufferVisualization();
      });
    } catch (error) {
      console.error("Failed to initialize compass for game scene:", error);
    }
  }

  override update(time: number, delta: number): void {
    // Update safe start counter
    if (this.safeStartCounter > 0) {
      this.safeStartCounter -= delta;
      if (this.safeStartCounter < 0) {
        this.safeStartCounter = 0;
      }
    }

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

    // Update projectiles
    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile.active) return false;
      projectile.update(this.time.now);
      return projectile.active;
    });

    this.checkProjectileCollisions();
    this.checkAmmoPackPickups();
    this.checkCoinPickups();
    this.checkHealthPackPickups();

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

  // DEBUG: Update compass buffer visualization
  private updateCompassBufferVisualization(): void {
    if (!this.uiScene || !this.compassService) return;

    // Get the compass instance from the service
    const compass = this.compassService.getCompass();
    if (compass && typeof compass.getHeadingBuffer === "function") {
      const headings = compass.getHeadingBuffer();
      this.uiScene.updateCompassBuffer(headings);
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
          zombie.takeDamage(projectile.getDamage(), projectileDirection);
          zombie.applyPushback(
            projectileDirection,
            gameConfig.projectilePushbackForce
          );
          projectile.destroy();
          break;
        }
      }
    }
  }

  private checkAmmoPackPickups(): void {
    if (!this.character) return;

    // Filter out picked up ammo packs and check for pickups
    this.ammoPacks = this.ammoPacks.filter((ammoPack) => {
      if (!ammoPack.isActive()) return false;

      const wasPickedUp = ammoPack.checkPickup(this.character!);
      return !wasPickedUp;
    });
  }

  private checkCoinPickups(): void {
    if (!this.character) return;

    // Filter out picked up coins and check for pickups
    this.coins = this.coins.filter((coin) => {
      if (!coin.isActive()) return false;

      const wasPickedUp = coin.checkPickup(this.character!);
      return !wasPickedUp;
    });
  }

  private checkHealthPackPickups(): void {
    if (!this.character) return;

    // Filter out picked up health packs and check for pickups
    this.healthPacks = this.healthPacks.filter((healthPack) => {
      if (!healthPack.isActive()) return false;

      const wasPickedUp = healthPack.checkPickup(this.character!);
      return !wasPickedUp;
    });
  }

  private handleZombieDeath(x: number, y: number): void {
    // Randomly choose between health pack, ammo pack, or coin with equal chance
    const randomValue = Math.random();
    let item: AmmoPack | Coin | HealthPack | undefined;

    if (randomValue < 0.1) {
      // Spawn coin
      item = new Coin(this, x, y);
      this.coins.push(item);
    } else if (randomValue < 0.2) {
      // Spawn health pack
      item = new HealthPack(this, x, y);
      this.healthPacks.push(item);
    } else if (randomValue < 0.6) {
      // Spawn ammo pack
      item = new AmmoPack(this, x, y);
      this.ammoPacks.push(item);
    }

    if (!item) return;

    // Tween item to random direction
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = 20 + Math.random() * 20;
    const targetX = x + Math.cos(randomAngle) * randomDistance;
    const targetY = y + Math.sin(randomAngle) * randomDistance;

    this.tweens.add({
      targets: item,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Power2",
    });
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

    // Clean up ammo packs
    this.ammoPacks.forEach((ammoPack) => {
      if (ammoPack && ammoPack.isActive()) {
        ammoPack.destroy();
      }
    });
    this.ammoPacks = [];

    // Clean up coins
    this.coins.forEach((coin) => {
      if (coin && coin.isActive()) {
        coin.destroy();
      }
    });
    this.coins = [];

    // Clean up health packs
    this.healthPacks.forEach((healthPack) => {
      if (healthPack && healthPack.isActive()) {
        healthPack.destroy();
      }
    });
    this.healthPacks = [];
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
    this.safeStartCounter = 3000;
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
    this.events.on("zombieDied", (x: number, y: number) => {
      this.handleZombieDeath(x, y);
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
        const playerPos = this.positionMarker?.getPosition();
        const hexWorldPos = HexagonUtils.hexagonToWorld(hex.q, hex.r);

        let spawnEmpty = false;
        if (playerPos && this.safeStartCounter > 0) {
          const distance = Phaser.Math.Distance.Between(
            playerPos.x / 8,
            playerPos.y / 8,
            hexWorldPos.x,
            hexWorldPos.y
          );
          // Spawn empty if within 10 meters and safe start counter is active
          spawnEmpty = distance <= 20;
        }

        this.spawnService.handleHexDiscovered(hex, spawnEmpty);
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
