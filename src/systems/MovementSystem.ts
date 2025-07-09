import { gameConfig } from "../config/gameConfig";
import { Character } from "../entities/Character";
import { PositionMarker } from "../entities/PositionMarker";
import { BaseSystem } from "./BaseSystem";

export class MovementSystem implements BaseSystem {
  private character: Character;
  private positionMarker: PositionMarker;

  constructor(character: Character, positionMarker: PositionMarker) {
    this.character = character;
    this.positionMarker = positionMarker;
  }

  update(_: number, _delta: number): void {
    // The character now handles its own movement through behaviors
    // This system can be used for additional movement logic if needed
    // For now, we just ensure the character follows the position marker when not in debug mode
    if (!gameConfig.devMode) {
      const markerPos = this.positionMarker.getPosition();
      this.character.setMovementTarget(markerPos.x, markerPos.y);
    }
  }

  destroy(): void {
    // Cleanup if needed
  }
}
