import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";

export class MovementSystem {
  private character: Character;
  private positionMarker: PositionMarker;

  constructor(character: Character, positionMarker: PositionMarker) {
    this.character = character;
    this.positionMarker = positionMarker;
  }

  update(time: number, delta: number): void {
    const characterPos = this.character.getPosition();
    const targetPos = this.positionMarker.getPosition();

    // Calculate distance to target
    const dx = targetPos.x - characterPos.x;
    const dy = targetPos.y - characterPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If character is already at the target position, no need to move
    if (distance <= 0.1) {
      // Small tolerance for floating point precision
      return;
    }

    // Calculate movement
    const speed = gameConfig.movementSpeed * gameConfig.scale;
    const moveDistance = speed * (delta / 1000); // Convert delta to seconds

    if (distance > 0) {
      // Normalize direction and apply movement
      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;

      // Check if new position would be further away than current position
      const newDistance = Math.sqrt(
        Math.pow(targetPos.x - (characterPos.x + moveX), 2) +
          Math.pow(targetPos.y - (characterPos.y + moveY), 2)
      );

      if (newDistance > distance) {
        // Would be further away, snap to target
        this.character.setPosition(targetPos.x, targetPos.y);
      } else {
        // Normal movement
        this.character.setPosition(
          characterPos.x + moveX,
          characterPos.y + moveY
        );
      }
    }
  }
}
