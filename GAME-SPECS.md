# GPS Adventure Game - Complete Specifications

## Overview

A real-world GPS-based treasure hunting game where players physically move around to collect treasures in a digital world. The game transforms real-world movement into character movement in a hexagonal grid-based game world.

## Core Game Mechanics

### Character Movement

- **Movement Type**: Fixed velocity movement towards GPS location marker
- **Speed**: 2 meters/second (configurable)
- **Behavior**: Character continuously moves towards the location marker unless already at it
- **Exception**: When walking towards a chest, character follows chest path instead of GPS marker
- **Stopping**: Character snaps to location marker when it would otherwise move past it (prevents oscillation)

### GPS Integration

- **Location Marker**: Semi-transparent circle representing current GPS position
- **Update Frequency**: Real-time GPS updates
- **Accuracy**: Uses raw GPS values (velocity + camera smoothing handles drift)
- **Boundaries**: No movement restrictions - unlimited world exploration

### Compass Integration

- **Map Rotation**: Entire map rotates around character position based on device compass
- **Rotation Center**: Character position
- **Entity Orientation**: All entity images remain upright (no rotation of sprites)
- **Camera**: Always centered on character position

## Visual Design

### Entity Representation

- **Shape**: All entities are circle-shaped with solid round borders
- **Player**: Green border, 2m radius
- **Treasures**: Golden border, variable radius
- **Trees**: No special border, variable radius
- **Location Marker**: Semi-transparent circle

### Display Scale

- **Base Scale**: 1 meter = 20 pixels (configurable)
- **Player Circle**: 2m radius = 40 pixels diameter
- **View Distance**: Configurable rendering distance
- **Populate Distance**: Larger than view distance for smooth spawning

## Grid System & Map Generation

### Hexagonal Grid

- **Hexagon Size**: 10m radius (configurable)
- **Population Trigger**: When hexagons come within populate distance
- **Spawn Method**: Random circle position within hexagon using half-hexagon radius
- **Persistence**: Once populated, hexagons maintain their features
- **No Respawning**: Collected treasures don't reappear

### Map Features

- **Trees**: Environmental decoration, no interaction
- **Chests**: Collectible treasures containing coins
- **Future Features**: Expandable system for additional entity types

## Treasure Collection System

### Chest Interaction

1. **Tap Detection**: Player taps on chest
2. **Character Movement**: Character walks to chest at fixed velocity
3. **Stopping**: Character stops when edges touch chest
4. **Modal Display**: Non-blocking modal opens with item image
5. **Options**:
   - **Collect**: Adds item to inventory, chest disappears
   - **Close**: Character returns to GPS marker position

### Inventory System

- **Initial Items**: Coins only
- **Future Expansion**: Support for items with special properties
- **Persistence**: Items saved between sessions

## User Interface

### Permission Flow

1. **Start Screen**: Game begins with permission request menu
2. **Sequential Requests**: GPS permission → Compass permission
3. **Error Handling**: Clear message if permissions denied
4. **Requirement**: Both GPS and Compass required to play

### Modal System

- **Non-Blocking**: Game continues running while modal open
- **Character State**: Character remains at chest until modal closes
- **Return Behavior**: Character walks back to GPS marker after modal closes

## Development Mode

### Configuration

- **Toggle**: Configurable boolean flag for development features
- **Start Location**: Helsinki coordinates (configurable)

### Development Controls

- **WASD Movement**: Move position marker at 3m/s speed
- **Q Key**: Rotate compass counter-clockwise at 0.3π/s
- **E Key**: Rotate compass clockwise at 0.3π/s

## Technical Architecture

### Global Configuration

```javascript
{
  playerSpeed: 2,              // meters/second
  playerRadius: 2,             // meters
  hexagonRadius: 10,           // meters
  viewDistance: 50,            // meters
  populateDistance: 70,        // meters
  scale: 20,                   // pixels per meter
  devMode: false,              // development controls
  startLocation: {             // Helsinki coordinates
    lat: 60.1699,
    lng: 24.9384
  }
}
```

### Core Systems

1. **GPS System**: Real-time location tracking
2. **Compass System**: Device orientation detection
3. **Grid System**: Hexagonal map generation and management
4. **Entity System**: Player, treasures, environmental features
5. **Movement System**: Character pathfinding and movement
6. **UI System**: Modals, permissions, inventory
7. **Persistence System**: Save/load game state

### Dependencies

- **Game Engine**: Phaser 3
- **Compass Library**: https://github.com/Luftare/universal-compass
- **Requirements**: Internet connection, GPS, Compass

## Performance Considerations

### Optimization Strategies

- **View Distance**: Limit rendered entities to view distance
- **Populate Distance**: Pre-populate hexagons outside view for smooth experience
- **Entity Pooling**: Reuse entity objects for performance
- **LOD System**: Future consideration for distance-based detail levels

### Memory Management

- **Hexagon Caching**: Cache populated hexagon data
- **Entity Cleanup**: Remove entities outside populate distance
- **Texture Management**: Efficient sprite and texture handling

## Future Enhancements

### Planned Features

- **Fog of War**: Shorter visibility for exploration mechanics
- **Obstacle Avoidance**: Trees become obstacles to navigate around
- **Item Properties**: Special effects and properties for collected items
- **Multiplayer**: Player interaction and shared world
- **Achievements**: Collection goals and milestones

### Technical Improvements

- **Offline Support**: Cached map data for limited offline play
- **Advanced GPS**: Improved accuracy and drift handling
- **Performance**: LOD system and advanced optimization
- **Accessibility**: Screen reader support and accessibility features

## Error Handling

### GPS Errors

- **No Signal**: Clear error message, retry mechanism
- **Poor Accuracy**: Continue with available data
- **Permission Denied**: Cannot proceed, show requirements

### Compass Errors

- **No Compass**: Fallback to north-up orientation
- **Calibration**: Guide user through compass calibration
- **Permission Denied**: Cannot proceed, show requirements

### Network Errors

- **No Internet**: Cannot start game, show connection requirement
- **Connection Lost**: Pause game, show reconnection prompt

## Testing Strategy

### Development Testing

- **Simulated GPS**: Use development controls for testing
- **Compass Simulation**: Manual rotation controls
- **Edge Cases**: Boundary conditions and error states
- **Performance**: Large map areas and entity counts

### Real-World Testing

- **GPS Accuracy**: Various environments and conditions
- **Compass Calibration**: Different devices and orientations
- **Movement Patterns**: Walking, running, stationary play
- **Battery Impact**: Power consumption optimization
