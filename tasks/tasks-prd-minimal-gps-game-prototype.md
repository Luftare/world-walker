# Task List: Minimal GPS Game Prototype

## Relevant Files

- `src/config/gameConfig.js` - Contains all game configuration parameters and settings
- `src/scenes/GameScene.js` - Main game scene with Phaser 3 setup and game loop
- `src/systems/MovementSystem.js` - Handles character movement towards position marker
- `src/systems/GridSystem.js` - Manages hexagonal grid generation and feature spawning
- `src/systems/CameraSystem.js` - Controls camera centering and rotation
- `src/systems/DebugSystem.js` - Handles debug controls (WASD, QE) and grid visualization
- `src/entities/Character.js` - Character entity with rendering and physics
- `src/entities/PositionMarker.js` - Position marker entity for movement target
- `src/entities/Feature.js` - Generic feature entity (green circles) for hexagons
- `src/utils/HexagonUtils.js` - Utility functions for hexagonal grid calculations
- `src/utils/CoordinateUtils.js` - Coordinate conversion and distance calculations
- `index.html` - Main HTML file with Phaser 3 setup
- `package.json` - Project dependencies and scripts

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MovementSystem.js` and `MovementSystem.test.js` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Project Setup and Configuration
- [ ] 2.0 Core Game Scene and Rendering
- [ ] 3.0 Character Movement System
- [ ] 4.0 Hexagonal Grid System
- [ ] 5.0 Camera and Debug Controls
