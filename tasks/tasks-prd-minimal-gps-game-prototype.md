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
  - [x] 1.1 Initialize project with package.json and dependencies
  - [ ] 1.2 Create game configuration file with all parameters
  - [ ] 1.3 Set up basic HTML structure with Phaser 3
  - [ ] 1.4 Create project directory structure
- [ ] 2.0 Core Game Scene and Rendering
  - [ ] 2.1 Create main GameScene class with Phaser 3 setup
  - [ ] 2.2 Implement basic game loop and update cycle
  - [ ] 2.3 Create Character entity with gray circle rendering
  - [ ] 2.4 Create PositionMarker entity with semi-transparent rendering
  - [ ] 2.5 Add entities to scene and verify rendering
- [ ] 3.0 Character Movement System
  - [ ] 3.1 Create MovementSystem class
  - [ ] 3.2 Implement smooth movement towards position marker
  - [ ] 3.3 Add stopping logic when reaching target
  - [ ] 3.4 Integrate movement system with game scene
- [ ] 4.0 Hexagonal Grid System
  - [ ] 4.1 Create HexagonUtils for grid calculations
  - [ ] 4.2 Create GridSystem for dynamic hexagon management
  - [ ] 4.3 Create Feature entity (green circles)
  - [ ] 4.4 Implement hexagon population logic
  - [ ] 4.5 Add grid persistence for populated hexagons
- [ ] 5.0 Camera and Debug Controls
  - [ ] 5.1 Create CameraSystem for centering and rotation
  - [ ] 5.2 Create DebugSystem for WASD and QE controls
  - [ ] 5.3 Implement grid visualization in debug mode
  - [ ] 5.4 Integrate all systems and test complete functionality
