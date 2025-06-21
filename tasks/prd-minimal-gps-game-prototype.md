# Product Requirements Document: Minimal GPS Game Prototype

## Introduction/Overview

This PRD defines the development of a minimal prototype for a GPS-based adventure game. The prototype focuses on core movement mechanics and hexagonal grid generation without real GPS/compass integration. The goal is to establish solid foundational systems before adding game content and real-world integration features.

**Problem**: Need to validate core game mechanics (movement, grid generation, camera) before investing in GPS/compass integration and game content.

**Goal**: Create a functional prototype that demonstrates smooth character movement, dynamic hexagonal grid population, and camera controls using debug controls.

## Goals

1. **Core Movement System**: Implement smooth character movement that follows a position marker
2. **Hexagonal Grid**: Create a dynamic hexagonal grid system that populates with features as the player moves
3. **Camera System**: Implement camera that centers on the player with rotation controls
4. **Debug Controls**: Provide WASD movement and QE rotation for testing without real GPS/compass
5. **Foundation**: Establish a solid technical foundation for future GPS integration and game content

## User Stories

1. **As a developer**, I want to move a position marker around using WASD keys so that I can test character movement without real GPS
2. **As a developer**, I want the character to smoothly follow the position marker so that I can validate movement mechanics
3. **As a developer**, I want to rotate the camera view using QE keys so that I can test compass-like functionality
4. **As a developer**, I want hexagons to populate with features as I move around so that I can validate the grid generation system
5. **As a developer**, I want to see the hexagonal grid when debug mode is enabled so that I can understand the underlying system

## Functional Requirements

1. **Character Movement**

   - Character must move smoothly towards the position marker at a fixed velocity
   - Character must stop when reaching the position marker (no oscillation)
   - Character must be represented as a gray circle with a border
   - Movement speed must be configurable (default: 2 meters/second)

2. **Position Marker**

   - Must be a semi-transparent circle representing the target position
   - Must be movable using WASD keys in debug mode
   - Must act as the movement target for the character

3. **Hexagonal Grid System**

   - Must use hexagonal cells with configurable radius (default: 10 meters)
   - Must dynamically populate cells when they come within populate distance
   - Must spawn one feature per hexagon (represented as green circle)
   - Must not have world boundaries (infinite generation)
   - Must persist populated cells (no respawning)

4. **Camera System**

   - Must always center on the character position
   - Must support rotation around the character using QE keys
   - Must use top-down 2D perspective
   - Must use configurable scale (default: 20 pixels per meter)

5. **Debug Mode**

   - Must be toggleable via configuration boolean
   - Must show hexagonal grid lines when enabled
   - Must enable WASD movement controls
   - Must enable QE rotation controls

6. **Visual Representation**
   - Character: Gray circle with border, 2-meter radius
   - Features: Green circles, variable radius
   - Position marker: Semi-transparent circle
   - Grid lines: Visible only in debug mode

## Non-Goals (Out of Scope)

- Real GPS integration
- Real compass integration
- Treasure collection system
- Inventory system
- User interface beyond debug controls
- Sound effects or music
- Performance optimizations
- Mobile responsiveness
- Offline functionality
- Multiplayer features
- Game content or theming

## Design Considerations

- **Minimal UI**: No HUD, coordinates display, or game menus
- **Clean Visuals**: Simple geometric shapes with clear borders
- **Debug Visibility**: Grid lines only visible in debug mode
- **Smooth Animation**: Character movement should be fluid and responsive
- **Top-Down Perspective**: 2D overhead view for clear spatial understanding

## Technical Considerations

- **Game Engine**: Phaser 3 for 2D rendering and game loop
- **Configuration-Driven**: All key parameters should be configurable
- **Modular Architecture**: Separate systems for movement, grid, camera, and debug controls
- **Extensible Design**: Systems should be designed to easily add GPS/compass later
- **State Management**: Simple state persistence for populated hexagons

## Success Metrics

1. **Functional Movement**: Character successfully follows position marker and stops at target
2. **Grid Generation**: Hexagons populate with features as player moves around
3. **Camera Control**: Camera centers on player and rotates smoothly with QE controls
4. **Debug Functionality**: WASD movement and grid visualization work correctly
5. **Performance**: Smooth 60 FPS gameplay without stuttering
6. **Code Quality**: Clean, modular code that can be easily extended

## Open Questions

1. **Feature Variety**: Should different hexagons have different types of features, or all the same for now?
2. **Grid Persistence**: Should populated hexagon data persist between sessions?
3. **Movement Precision**: What tolerance should be used for "reaching" the position marker?
4. **Camera Rotation Speed**: What should be the rotation speed for QE controls?
5. **Populate Distance**: What distance should trigger hexagon population?

## Configuration Parameters

```javascript
{
  playerSpeed: 2,              // meters/second
  playerRadius: 2,             // meters
  hexagonRadius: 10,           // meters
  populateDistance: 70,        // meters
  scale: 20,                   // pixels per meter
  devMode: true,               // debug controls enabled
  rotationSpeed: 0.3,          // radians per second for QE rotation
  movementSpeed: 3             // meters per second for WASD movement
}
```

## Development Phases

1. **Phase 1**: Basic character and position marker rendering
2. **Phase 2**: Character movement towards position marker
3. **Phase 3**: WASD debug controls for position marker
4. **Phase 4**: Hexagonal grid system and feature spawning
5. **Phase 5**: Camera centering and QE rotation controls
6. **Phase 6**: Debug mode grid visualization
7. **Phase 7**: Testing and refinement

## Target Audience

This PRD is written for a junior developer who needs to understand the core mechanics and implementation requirements for the minimal prototype. The focus is on establishing foundational systems that can be built upon for the full GPS adventure game.
