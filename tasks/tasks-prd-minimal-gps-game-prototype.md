# Task List: Minimal GPS Game Prototype

## Relevant Files

- `src/config/gameConfig.ts` - Contains all game configuration parameters and settings with TypeScript types
- `dist/config/gameConfig.js` - Compiled JavaScript version of game configuration
- `index.html` - Main HTML file with Phaser 3 setup and game initialization
- `src/scenes/GameScene.ts` - Main game scene with Phaser 3 setup and game loop
- `src/systems/MovementSystem.ts` - Handles character movement towards position marker
- `src/systems/GridSystem.ts` - Manages hexagonal grid generation and feature spawning
- `src/systems/CameraSystem.ts` - Controls camera centering and rotation
- `src/systems/DebugSystem.ts` - Handles debug controls (WASD, QE) and grid visualization
- `src/entities/Character.ts` - Character entity with rendering and physics
- `src/entities/PositionMarker.ts` - Position marker entity for movement target
- `src/entities/Feature.ts` - Generic feature entity (green circles) for hexagons
- `src/utils/HexagonUtils.ts` - Utility functions for hexagonal grid calculations
- `src/utils/CoordinateUtils.ts` - Coordinate conversion and distance calculations
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules for the project

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MovementSystem.js` and `MovementSystem.test.js` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Project Setup and Configuration
  - [x] 1.1 Initialize project with package.json and dependencies
  - [x] 1.2 Create game configuration file with all parameters
  - [x] 1.3 Set up basic HTML structure with Phaser 3
  - [x] 1.4 Create project directory structure
- [x] 2.0 Core Game Scene and Rendering
  - [x] 2.1 Create main GameScene class with Phaser 3 setup
  - [x] 2.2 Implement basic game loop and update cycle
  - [x] 2.3 Create Character entity with gray circle rendering
  - [x] 2.4 Create PositionMarker entity with semi-transparent rendering
  - [x] 2.5 Add entities to scene and verify rendering
- [x] 3.0 Character Movement System
  - [x] 3.1 Create MovementSystem class
  - [x] 3.2 Implement smooth movement towards position marker
  - [x] 3.3 Add overshoot detection logic for stopping
  - [x] 3.4 Integrate movement system with game scene
- [x] 4.0 Hexagonal Grid System
  - [x] 4.1 Create HexagonUtils for grid calculations
  - [x] 4.2 Create GridSystem for dynamic hexagon management
  - [x] 4.3 Create Feature entity (green circles)
  - [x] 4.4 Implement hexagon population logic
  - [x] 4.5 Add grid persistence for populated hexagons
- [x] 5.0 Camera and Debug Controls
  - [x] 5.1 Create CameraSystem for centering and rotation
  - [x] 5.2 Create DebugSystem for WASD and QE controls
  - [x] 5.3 Implement grid visualization in debug mode
  - [x] 5.4 Integrate all systems and test complete functionality
