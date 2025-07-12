/**
 * Game Configuration
 * Contains all configurable parameters for the GPS game prototype
 */

export interface GameConfig {
  geoPixelsPerMeter: number;
  playerSpeed: number;
  playerRadius: number;
  markerRadius: number;
  hexagonRadius: number;
  populateDistance: number;
  devMode: boolean;
  rotationSpeed: number;
  movementSpeed: number;
  debugMovementSpeed: number;
  featureRadius: number;
  markerAlpha: number;
  colors: {
    player: number;
    playerBorder: number;
    feature: number;
    featureBorder: number;
    marker: number;
    grid: number;
    background: number;
  };
  world: {
    startLocation: {
      x: number;
      y: number;
    };
  };
}

export const gameConfig: GameConfig = {
  geoPixelsPerMeter: 10, // This is used solely for the distance travelled in pixels when new location is received.
  playerSpeed: 24,
  playerRadius: 16,
  markerRadius: 16,
  hexagonRadius: 176,
  populateDistance: 320,
  devMode: false,
  rotationSpeed: 2.0,
  movementSpeed: 24,
  debugMovementSpeed: 300,
  featureRadius: 24, // 3 * 8
  markerAlpha: 0.6,
  colors: {
    player: 0x666666,
    playerBorder: 0x404040,
    feature: 0x44ff44,
    featureBorder: 0x228822,
    marker: 0x4444ff,
    grid: 0xffffff,
    background: 0x000000,
  },
  world: {
    startLocation: {
      x: 0,
      y: 0,
    },
  },
};
