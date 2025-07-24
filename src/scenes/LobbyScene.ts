import Phaser from "phaser";
import { GeolocationService } from "../utils/GeolocationService";
import { CompassService } from "../utils/CompassService";
import { createAnimations, loadAssets } from "../utils/AssetLoadHelpers";

export class LobbyScene extends Phaser.Scene {
  private geolocationService?: GeolocationService;
  private compassService?: CompassService;
  private lobbyContainer?: HTMLDivElement;
  private startGameButton?: HTMLButtonElement;
  private titleText?: HTMLHeadingElement;
  private isGameOver: boolean = false;
  private locationWatchId: number | null = null;

  constructor() {
    super({ key: "LobbyScene" });
  }

  preload(): void {
    loadAssets(this);
  }

  create(data?: {
    geolocationService?: GeolocationService;
    compassService?: CompassService;
    isGameOver?: boolean;
  }): void {
    createAnimations(this);
    // Store services if provided
    if (data?.geolocationService) {
      this.geolocationService = data.geolocationService;
    }
    if (data?.compassService) {
      this.compassService = data.compassService;
    }
    if (data?.isGameOver !== undefined) {
      this.isGameOver = data.isGameOver;
    }

    // Start listening to location updates and calibrate origo
    if (this.geolocationService) {
      this.startLobbyLocationCalibration();
    }

    this.createHTMLLobby();

    const music = data?.isGameOver ?? false ? "death-music" : "theme";

    this.sound.play(music, { loop: true, volume: 0.5 });
  }

  private createHTMLLobby(): void {
    // Create main lobby container
    this.lobbyContainer = document.createElement("div");
    this.lobbyContainer.style.position = "absolute";
    this.lobbyContainer.style.top = "50%";
    this.lobbyContainer.style.left = "50%";
    this.lobbyContainer.style.transform = "translate(-50%, -50%)";
    this.lobbyContainer.style.zIndex = "1000";
    this.lobbyContainer.style.textAlign = "center";
    this.lobbyContainer.style.fontFamily = "Arial, sans-serif";

    // Create title
    this.titleText = document.createElement("h1");
    this.titleText.textContent = this.isGameOver
      ? "Game Over"
      : "Are you ready?";
    this.titleText.style.color = "#ffffff";
    this.titleText.style.fontSize = "32px";
    this.titleText.style.marginBottom = "20px";
    this.titleText.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";

    // Create start game button
    this.startGameButton = document.createElement("button");
    this.startGameButton.textContent = "Start Game";
    this.startGameButton.style.display = "block";
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

    // Add event listener
    this.startGameButton.addEventListener("click", () => this.startGame());

    // Assemble lobby
    this.lobbyContainer.appendChild(this.titleText);
    this.lobbyContainer.appendChild(this.startGameButton);

    // Add to DOM
    document.body.appendChild(this.lobbyContainer);
  }

  private startLobbyLocationCalibration(): void {
    if (!this.geolocationService) return;
    // Use browser geolocation directly for lobby calibration
    this.locationWatchId = window.navigator.geolocation.watchPosition(
      (position) => {
        const newOrigo = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        this.geolocationService!.calibrateGameOrigo(newOrigo);
      },
      undefined,
      { enableHighAccuracy: true, timeout: 99999999999, maximumAge: 3000 }
    );
  }

  private stopLobbyLocationCalibration(): void {
    if (this.locationWatchId !== null) {
      window.navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  private startGame(): void {
    this.sound.stopAll();
    // Clean up HTML elements before starting the game
    this.cleanupHTMLLobby();
    // Stop lobby calibration before starting the game
    this.stopLobbyLocationCalibration();
    // Pass the services to the game scene
    this.scene.start("GameScene", {
      geolocationService: this.geolocationService,
      compassService: this.compassService,
    });
  }

  private cleanupHTMLLobby(): void {
    // Remove lobby container and all its children
    if (this.lobbyContainer && this.lobbyContainer.parentNode) {
      this.lobbyContainer.parentNode.removeChild(this.lobbyContainer);
    }
  }
}
