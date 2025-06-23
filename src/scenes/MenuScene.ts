import Phaser from "phaser";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";
import { UniversalCompass } from "../utils/Compass";

export class MenuScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private actionButton?: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;
  private devicePixelRatio: number;
  private currentStep: "location" | "compass" | "complete" = "location";
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;
  private testCompassButton?: HTMLButtonElement;
  private compassLogDiv?: HTMLDivElement;

  constructor() {
    super({ key: "MenuScene" });
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  create(): void {
    this.createUIElements();
    this.createCompassTestButton();
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

  private createCompassTestButton(): void {
    // Create HTML button for isolated compass test
    this.testCompassButton = document.createElement("button");
    this.testCompassButton.textContent = "Test Compass (Isolated)";
    this.testCompassButton.style.position = "absolute";
    this.testCompassButton.style.top = "20px";
    this.testCompassButton.style.right = "20px";
    this.testCompassButton.style.zIndex = "1000";
    this.testCompassButton.style.padding = "10px 15px";
    this.testCompassButton.style.backgroundColor = "#ff6600";
    this.testCompassButton.style.color = "white";
    this.testCompassButton.style.border = "none";
    this.testCompassButton.style.borderRadius = "5px";
    this.testCompassButton.style.fontSize = "14px";
    this.testCompassButton.style.cursor = "pointer";

    // Create log div for compass data
    this.compassLogDiv = document.createElement("div");
    this.compassLogDiv.style.position = "absolute";
    this.compassLogDiv.style.top = "70px";
    this.compassLogDiv.style.right = "20px";
    this.compassLogDiv.style.zIndex = "1000";
    this.compassLogDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.compassLogDiv.style.color = "white";
    this.compassLogDiv.style.padding = "10px";
    this.compassLogDiv.style.borderRadius = "5px";
    this.compassLogDiv.style.fontSize = "12px";
    this.compassLogDiv.style.fontFamily = "monospace";
    this.compassLogDiv.style.maxWidth = "300px";
    this.compassLogDiv.style.maxHeight = "200px";
    this.compassLogDiv.style.overflow = "auto";
    this.compassLogDiv.textContent = "Compass logs will appear here...";

    // Add to DOM
    document.body.appendChild(this.testCompassButton);
    document.body.appendChild(this.compassLogDiv);

    // Add click handler
    this.testCompassButton.addEventListener("click", () =>
      this.testCompassIsolated()
    );
  }

  private async testCompassIsolated(): Promise<void> {
    if (!this.compassLogDiv) return;

    this.logCompassMessage("Starting isolated compass test...");

    try {
      // Create a completely new compass instance
      const testCompass = new UniversalCompass();

      this.logCompassMessage("Created new UniversalCompass instance");

      // Request permission with direct user gesture
      this.logCompassMessage("Requesting permission...");
      await testCompass.requestPermission();
      this.logCompassMessage("✅ Permission granted!");

      // Set up heading callback
      testCompass.onHeading((heading: number) => {
        this.logCompassMessage(`Heading: ${heading.toFixed(1)}°`);
      });

      this.logCompassMessage("Compass tracking started successfully!");
    } catch (error) {
      this.logCompassMessage(`❌ Error: ${error}`);
      console.error("Isolated compass test error:", error);
    }
  }

  private logCompassMessage(message: string): void {
    if (!this.compassLogDiv) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    this.compassLogDiv.textContent += "\n" + logEntry;
    this.compassLogDiv.scrollTop = this.compassLogDiv.scrollHeight;

    console.log(logEntry);
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
