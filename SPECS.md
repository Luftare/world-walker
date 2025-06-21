# GPS Adventure Game

This game turns real world into a game where players collect treasures.

## Mechanics

It's a top-down game where player sees his character in a game world. All the entities in the map are circle-shaped with solid round borders indicating the type of entities they are. Inside the circle there's an avatar image of the entity.

There's also a location marker, a semi-transparent circle representing the GPS location of the player's device.

The player character moves in a fixed velocity and moves towards the location marker. This way the player can move the character by moving around in the real world.

When the player reaches the location market, it stops moving. Technically, it snaps to the location marker at a tick where it would otherwise move past the marker point. This way the character doesn't oscillate around the marker upon reaching it.

The map rotates based on the device compass heading. The camera follows the character position.

Colors:

- Player has green border.
- Tresures have golder border.

There are random environmental features.

## Global config

There's a global config file that helps adjusting the game parameters. At least these things should be there:

- how far the player can see (meters)
- how large are the hexagons in the grid (meters)

## Grid system and map generation

The game uses a hexagonal grid system to generate the map. The game checks for visible hexagons, and upon viewing an empty hexagon, it populates features in it. The features are randomised inside the hexagon using a random circle position inside the hexagon with half of the hexagon radius for the spawn circle. This way features are distributed without overlap.

## Units

The game logic uses meters as the unit. UI and non-game logic related units can be whatever fits best. The meters unit help reasoning and adjusting the things such as velocities, dimenstions, and distances to fine-tune the game experience. Use global configuration or consts for setting the scale so that it's easy to change it just by changing the scale from one place of the code.

## Features

- Tree (no interaction)
- Chest

## Chests

Upon tapping on the treasure, the character walks at the chest and stops next to it.

A modal opens with an item image in it and buttons:

- Collect
- Close (don't collect)

Closing the modal makes the character walk back to the position marker.

Collecting the treasure saves the treasure in the inventory of the player. The chest disappears.

## Development mode

The game starts with Helsinki coordinates.

The position marker can be moved by "WASD" with 3 meters/second speed.

The character moves 2 meters/second.

Q rotates the compass anti-clockwise and E rotates clock-wise 0.3\*PI/second.

## Tech

Let's use Phaser 3 as the engine.

For compass, use this:
https://github.com/Luftare/universal-compass
