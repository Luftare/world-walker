import { Behavior } from "./Behavior";

export class BehaviorManager {
  private behaviors: Map<string, Behavior> = new Map();

  addBehavior(name: string, behavior: Behavior): void {
    this.behaviors.set(name, behavior);
  }

  getBehavior<T extends Behavior>(name: string): T | undefined {
    return this.behaviors.get(name) as T;
  }

  hasBehavior(name: string): boolean {
    return this.behaviors.has(name);
  }

  removeBehavior(name: string): void {
    const behavior = this.behaviors.get(name);
    if (behavior) {
      behavior.destroy();
      this.behaviors.delete(name);
    }
  }

  update(time: number, delta: number): void {
    this.behaviors.forEach((behavior) => {
      behavior.update(time, delta);
    });
  }

  destroy(): void {
    this.behaviors.forEach((behavior) => behavior.destroy());
    this.behaviors.clear();
  }
}
