/**
 * Game Configuration
 * Contains all configurable parameters for the GPS game prototype
 */

export interface GameConfig {
  playerSpeed: number;
  playerRadius: number;
  hexagonRadius: number;
  populateDistance: number;
  scale: number;
  devMode: boolean;
  rotationSpeed: number;
  movementSpeed: number;
  debugMovementSpeed: number;
  featureRadius: number;
  markerRadius: number;
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
  geolocation: {
    enabled: boolean;
  };
}

export const gameConfig: GameConfig = {
  playerSpeed: 2,
  playerRadius: 3,
  hexagonRadius: 10,
  populateDistance: 70,
  scale: 20,
  devMode: true,
  rotationSpeed: 1.0,
  movementSpeed: 3,
  debugMovementSpeed: 300,
  featureRadius: 2,
  markerRadius: 1,
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
  geolocation: {
    enabled: true,
  },
};
