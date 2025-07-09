import { Point } from "../types/types";

export interface IMovementBehavior {
  setTarget(target: Point): void;
  setFinalTarget(finalTarget: Point): void;
  getTarget(): Point | undefined;
  getFinalTarget(): Point | undefined;
  clearTarget(): void;
  isMovingTowardsTarget(): boolean;
  setSpeed(speed: number): void;
  getSpeed(): number;
  setFlockingEnabled(enabled: boolean): void;
  setAvoidRadius(radius: number): void;
  setAvoidWeight(weight: number): void;
  setTargetWeight(weight: number): void;
  setDirectionDamp(damp: number): void;
  getDirectionDamp(): number;
  update(time: number, delta: number): void;
  destroy(): void;
}
