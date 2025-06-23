import Phaser from "phaser";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";

export class MenuScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private actionButton?: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;
  private devicePixelRatio: number;
  private currentStep: "location" | "compass" | "complete" = "location";
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;

  constructor() {
    super({ key: "MenuScene" });
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  create(): void {
    this.createUIElements();
    this.updateUI();
  }

  private createUIElements(): void {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;

    // Title
    this.titleText = this.add.text(
      centerX,
      centerY - 100 * this.devicePixelRatio,
      "GPS Game",
      {
        fontSize: `${32 * this.devicePixelRatio}px`,
        color: "#ffffff",
        fontStyle: "bold",
      }
    );
    this.titleText.setOrigin(0.5);

    // Instruction text
    this.instructionText = this.add.text(
      centerX,
      centerY - 20 * this.devicePixelRatio,
      "",
      {
        fontSize: `${18 * this.devicePixelRatio}px`,
        color: "#cccccc",
        align: "center",
      }
    );
    this.instructionText.setOrigin(0.5);

    // Action button
    this.actionButton = this.add.text(
      centerX,
      centerY + 40 * this.devicePixelRatio,
      "",
      {
        fontSize: `${20 * this.devicePixelRatio}px`,
        color: "#ffffff",
        backgroundColor: "#0066cc",
        padding: {
          x: 20 * this.devicePixelRatio,
          y: 10 * this.devicePixelRatio,
        },
      }
    );
    this.actionButton.setOrigin(0.5);
    this.actionButton.setInteractive({ useHandCursor: true });
    this.actionButton.on("pointerdown", () => this.handleActionButtonClick());

    // Error text
    this.errorText = this.add.text(
      centerX,
      centerY + 100 * this.devicePixelRatio,
      "",
      {
        fontSize: `${16 * this.devicePixelRatio}px`,
        color: "#ff6666",
        align: "center",
      }
    );
    this.errorText.setOrigin(0.5);
  }

  private updateUI(): void {
    if (!this.instructionText || !this.actionButton) return;

    switch (this.currentStep) {
      case "location":
        this.instructionText.setText("Start by enabling location");
        this.actionButton.setText("Enable Location");
        this.actionButton.setStyle({ backgroundColor: "#0066cc" });
        break;
      case "compass":
        this.instructionText.setText("Enable compass");
        this.actionButton.setText("Enable Compass");
        this.actionButton.setStyle({ backgroundColor: "#0066cc" });
        break;
      case "complete":
        this.instructionText.setText("All permissions granted!");
        this.actionButton.setText("Start Game");
        this.actionButton.setStyle({ backgroundColor: "#00cc66" });
        break;
    }

    // Clear error text
    if (this.errorText) {
      this.errorText.setText("");
    }
  }

  private async handleActionButtonClick(): Promise<void> {
    if (this.currentStep === "complete") {
      this.startGame();
      return;
    }

    try {
      if (this.currentStep === "location") {
        await this.enableLocation();
      } else if (this.currentStep === "compass") {
        await this.enableCompass();
      }
    } catch (error) {
      this.showError(`Failed to enable ${this.currentStep}: ${error}`);
    }
  }

  private async enableLocation(): Promise<void> {
    if (!this.geolocationService) {
      this.geolocationService = new GeolocationService();
    }

    const hasPermission =
      await this.geolocationService.requestLocationPermission();

    if (!hasPermission) {
      throw new Error("Location permission denied");
    }

    // Test getting initial location
    await this.geolocationService.getInitialLocation();

    this.currentStep = "compass";
    this.updateUI();
  }

  private async enableCompass(): Promise<void> {
    if (!this.compassService) {
      console.log("Creating compass service");
      this.compassService = new CompassService();
    }
    console.log("Requesting compass permission");
    const hasPermission = await this.compassService.requestCompassPermission();
    console.log("Compass permission", hasPermission);
    if (!hasPermission) {
      throw new Error("Compass permission denied");
    }

    // Start compass tracking immediately after permission is granted
    // This keeps it in the same call chain as the user gesture
    this.compassService.startCompassTracking(() => {
      // This callback will be used by the game scene
      // For now, we just store the service with tracking started
    });

    this.currentStep = "complete";
    this.updateUI();
  }

  private showError(message: string): void {
    if (this.errorText) {
      this.errorText.setText(message);
    }
  }

  private startGame(): void {
    // Pass the services to the game scene
    this.scene.start("GameScene", {
      geolocationService: this.geolocationService,
      compassService: this.compassService,
    });
  }

  resize(): void {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;

    if (this.titleText) {
      this.titleText.setPosition(
        centerX,
        centerY - 100 * this.devicePixelRatio
      );
    }

    if (this.instructionText) {
      this.instructionText.setPosition(
        centerX,
        centerY - 20 * this.devicePixelRatio
      );
    }

    if (this.actionButton) {
      this.actionButton.setPosition(
        centerX,
        centerY + 40 * this.devicePixelRatio
      );
    }

    if (this.errorText) {
      this.errorText.setPosition(
        centerX,
        centerY + 100 * this.devicePixelRatio
      );
    }
  }
}
