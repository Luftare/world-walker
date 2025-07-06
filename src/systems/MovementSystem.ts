import Phaser from "phaser";
import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";

export class MovementSystem {
  private character: Character;
  private positionMarker: PositionMarker;
  private characterPos: Phaser.Math.Vector2;
  private targetPos: Phaser.Math.Vector2;
  private direction: Phaser.Math.Vector2;

  constructor(character: Character, positionMarker: PositionMarker) {
    this.character = character;
    this.positionMarker = positionMarker;
    this.characterPos = new Phaser.Math.Vector2();
    this.targetPos = new Phaser.Math.Vector2();
    this.direction = new Phaser.Math.Vector2();
  }

  update(_: number, delta: number): void {
    // Get current positions
    const charPos = this.character.getPosition();
    const markerPos = this.positionMarker.getPosition();

    this.characterPos.set(charPos.x, charPos.y);
    this.targetPos.set(markerPos.x, markerPos.y);

    // Calculate distance to target using Phaser's distance method
    const distance = this.characterPos.distance(this.targetPos);

    // If character is already at the target position, no need to move
    if (distance <= 0.1) {
      // Small tolerance for floating point precision
      return;
    }

    // Calculate movement
    const speed = gameConfig.movementSpeed * gameConfig.scale;
    const moveDistance = speed * (delta / 1000); // Convert delta to seconds

    if (distance > 0) {
      // Calculate direction vector using Phaser's subtract and normalize
      this.direction
        .copy(this.targetPos)
        .subtract(this.characterPos)
        .normalize();

      // Calculate new position using Phaser's scale and add
      const newPosition = this.characterPos
        .clone()
        .add(this.direction.clone().scale(moveDistance));

      // Check if new position would be further away than current position
      const newDistance = newPosition.distance(this.targetPos);

      if (newDistance > distance) {
        // Would be further away, snap to target
        this.character.setPosition(this.targetPos.x, this.targetPos.y);
      } else {
        // Normal movement
        this.character.setPosition(newPosition.x, newPosition.y);
      }
    }
  }
}
