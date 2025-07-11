/**
 * Game Configuration
 * Contains all configurable parameters for the GPS game prototype
 */

export interface GameConfig {
  playerSpeed: number;
  playerRadius: number;
  markerRadius: number;
  hexagonRadius: number;
  populateDistance: number;
  scale: number;
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
  playerSpeed: 3,
  playerRadius: 2,
  markerRadius: 2,
  hexagonRadius: 22,
  populateDistance: 40,
  scale: 8,
  devMode: true,
  rotationSpeed: 2.0,
  movementSpeed: 3,
  debugMovementSpeed: 300,
  featureRadius: 3,
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
