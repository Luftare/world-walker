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
}

export const gameConfig: GameConfig = {
  playerSpeed: 2,
  playerRadius: 2,
  hexagonRadius: 10,
  populateDistance: 70,
  scale: 20,
  devMode: true,
  rotationSpeed: 0.3,
  movementSpeed: 3,
  featureRadius: 1.5,
  markerRadius: 1,
  markerAlpha: 0.6,
  colors: {
    player: 0x808080,
    playerBorder: 0x404040,
    feature: 0x00ff00,
    featureBorder: 0x008000,
    marker: 0x0000ff,
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
