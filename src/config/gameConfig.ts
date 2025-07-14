/**
 * Game Configuration
 * Contains all configurable parameters for the GPS game prototype
 */

export const gameConfig = {
  aggroRange: 240,
  spawnMinDistance: 250,
  geoPixelsPerMeter: 10,
  playerSpeed: 30,
  playerRadius: 20,
  markerRadius: 20,
  itemRadius: 12,
  itemPickupRadius: 60,
  markerAlpha: 0.4,
  projectilePushbackForce: 500,
  hexagonRadius: 120,
  populateDistance: 250,
  devMode: false,
  rotationSpeed: 2.0,
  movementSpeed: 35,
  enemySpeed: 14,
  debugMovementSpeed: 300,
  featureRadius: 24,
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
} as const;

export type GameConfig = typeof gameConfig;
