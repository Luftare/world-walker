import Phaser from "phaser";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";

export class MenuScene extends Phaser.Scene {
  private currentStep: "compass" | "location" | "complete" = "compass";
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;
  private menuContainer?: HTMLDivElement;
  private compassButton?: HTMLButtonElement;
  private locationButton?: HTMLButtonElement;
  private startGameButton?: HTMLButtonElement;
  private statusDiv?: HTMLDivElement;

  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    this.createHTMLMenu();
    this.updateUI();
  }

  private createHTMLMenu(): void {
    // Create main menu container
    this.menuContainer = document.createElement("div");
    this.menuContainer.style.position = "absolute";
    this.menuContainer.style.top = "50%";
    this.menuContainer.style.left = "50%";
    this.menuContainer.style.transform = "translate(-50%, -50%)";
    this.menuContainer.style.zIndex = "1000";
    this.menuContainer.style.textAlign = "center";
    this.menuContainer.style.fontFamily = "Arial, sans-serif";

    // Create title
    const title = document.createElement("h1");
    title.textContent = "GPS Game";
    title.style.color = "#ffffff";
    title.style.fontSize = "32px";
    title.style.marginBottom = "20px";
    title.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";

    // Create status display
    this.statusDiv = document.createElement("div");
    this.statusDiv.style.color = "#cccccc";
    this.statusDiv.style.fontSize = `${16}px`;
    this.statusDiv.style.marginBottom = "20px";
    this.statusDiv.style.minHeight = "40px";

    // Create compass button
    this.compassButton = document.createElement("button");
    this.compassButton.textContent = "Enable Compass";
    this.compassButton.style.display = "block";
    this.compassButton.style.width = "200px";
    this.compassButton.style.margin = "10px auto";
    this.compassButton.style.padding = "15px 20px";
    this.compassButton.style.fontSize = `${18}px`;
    this.compassButton.style.backgroundColor = "#0066cc";
    this.compassButton.style.color = "white";
    this.compassButton.style.border = "none";
    this.compassButton.style.borderRadius = "8px";
    this.compassButton.style.cursor = "pointer";
    this.compassButton.style.transition = "background-color 0.3s";

    // Create location button
    this.locationButton = document.createElement("button");
    this.locationButton.textContent = "Enable Location";
    this.locationButton.style.display = "none";
    this.locationButton.style.width = "200px";
    this.locationButton.style.margin = "10px auto";
    this.locationButton.style.padding = "15px 20px";
    this.locationButton.style.fontSize = "18px";
    this.locationButton.style.backgroundColor = "#0066cc";
    this.locationButton.style.color = "white";
    this.locationButton.style.border = "none";
    this.locationButton.style.borderRadius = "8px";
    this.locationButton.style.cursor = "pointer";
    this.locationButton.style.transition = "background-color 0.3s";

    // Create start game button
    this.startGameButton = document.createElement("button");
    this.startGameButton.textContent = "Start Game";
    this.startGameButton.style.display = "none";
    this.startGameButton.style.width = "200px";
    this.startGameButton.style.margin = "10px auto";
    this.startGameButton.style.padding = "15px 20px";
    this.startGameButton.style.fontSize = "18px";
    this.startGameButton.style.backgroundColor = "#00cc66";
    this.startGameButton.style.color = "white";
    this.startGameButton.style.border = "none";
    this.startGameButton.style.borderRadius = "8px";
    this.startGameButton.style.cursor = "pointer";
    this.startGameButton.style.transition = "background-color 0.3s";

    // Add event listeners
    this.compassButton.addEventListener("click", () =>
      this.handleCompassClick()
    );
    this.locationButton.addEventListener("click", () =>
      this.handleLocationClick()
    );
    this.startGameButton.addEventListener("click", () => this.startGame());

    // Add hover effects
    this.compassButton.addEventListener("mouseenter", () => {
      if (this.compassButton) {
        this.compassButton.style.backgroundColor = "#0055aa";
      }
    });
    this.compassButton.addEventListener("mouseleave", () => {
      if (this.compassButton) {
        this.compassButton.style.backgroundColor = "#0066cc";
      }
    });

    this.locationButton.addEventListener("mouseenter", () => {
      if (this.locationButton) {
        this.locationButton.style.backgroundColor = "#0055aa";
      }
    });
    this.locationButton.addEventListener("mouseleave", () => {
      if (this.locationButton) {
        this.locationButton.style.backgroundColor = "#0066cc";
      }
    });

    this.startGameButton.addEventListener("mouseenter", () => {
      if (this.startGameButton) {
        this.startGameButton.style.backgroundColor = "#00aa55";
      }
    });
    this.startGameButton.addEventListener("mouseleave", () => {
      if (this.startGameButton) {
        this.startGameButton.style.backgroundColor = "#00cc66";
      }
    });

    // Assemble menu
    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(this.statusDiv);
    this.menuContainer.appendChild(this.compassButton);
    this.menuContainer.appendChild(this.locationButton);
    this.menuContainer.appendChild(this.startGameButton);

    // Add to DOM
    document.body.appendChild(this.menuContainer);
  }

  private async handleCompassClick(): Promise<void> {
    if (!this.statusDiv || !this.compassButton) return;

    this.statusDiv.textContent = "Requesting compass permission...";
    this.compassButton.disabled = true;
    this.compassButton.style.backgroundColor = "#666666";

    try {
      if (!this.compassService) {
        this.compassService = new CompassService();
      }

      const hasPermission =
        await this.compassService.requestCompassPermission();

      if (!hasPermission) {
        throw new Error("Compass permission denied");
      }

      // Start compass tracking immediately after permission is granted
      this.compassService.startCompassTracking(() => {
        // This callback will be used by the game scene
      });

      this.statusDiv.textContent = "✅ Compass enabled successfully!";
      if (this.compassButton) {
        this.compassButton.style.backgroundColor = "#00cc66";
        this.compassButton.textContent = "Compass ✓";
      }

      // Move to next step
      this.currentStep = "location";
      if (this.locationButton) {
        this.locationButton.style.display = "block";
      }
    } catch (error) {
      this.statusDiv.textContent = `❌ Compass error: ${error}`;
      if (this.compassButton) {
        this.compassButton.disabled = false;
        this.compassButton.style.backgroundColor = "#cc0000";
      }
      console.error("Compass permission error:", error);
    }
  }

  private async handleLocationClick(): Promise<void> {
    if (!this.statusDiv || !this.locationButton) return;

    this.statusDiv.textContent = "Requesting location permission...";
    this.locationButton.disabled = true;
    this.locationButton.style.backgroundColor = "#666666";

    try {
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

      this.statusDiv.textContent = "✅ Location enabled successfully!";
      if (this.locationButton) {
        this.locationButton.style.backgroundColor = "#00cc66";
        this.locationButton.textContent = "Location ✓";
      }

      // Move to final step
      this.currentStep = "complete";
      if (this.startGameButton) {
        this.startGameButton.style.display = "block";
      }
    } catch (error) {
      this.statusDiv.textContent = `❌ Location error: ${error}`;
      if (this.locationButton) {
        this.locationButton.disabled = false;
        this.locationButton.style.backgroundColor = "#cc0000";
      }
      console.error("Location permission error:", error);
    }
  }

  private updateUI(): void {
    // Update status text based on current step
    if (this.statusDiv) {
      switch (this.currentStep) {
        case "compass":
          this.statusDiv.textContent = "Start by enabling compass";
          break;
        case "location":
          this.statusDiv.textContent = "Now enable location";
          break;
        case "complete":
          this.statusDiv.textContent = "All permissions granted!";
          break;
      }
    }
  }

  private startGame(): void {
    // Clean up HTML elements before starting the game
    this.cleanupHTMLMenu();

    // Pass the services to the game scene
    this.scene.start("GameScene", {
      geolocationService: this.geolocationService,
      compassService: this.compassService,
    });
  }

  private cleanupHTMLMenu(): void {
    // Remove menu container and all its children
    if (this.menuContainer && this.menuContainer.parentNode) {
      this.menuContainer.parentNode.removeChild(this.menuContainer);
    }
  }

  resize(): void {
    // No-op: all menu UI is now HTML-based and responsive
  }
}
