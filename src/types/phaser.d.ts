declare namespace Phaser {
  class Scene {
    constructor(config?: any);
    preload(): void;
    create(): void;
    update(time?: number, delta?: number): void;
    add: Phaser.GameObjects.GameObjectFactory;
    input: Phaser.Input.InputPlugin;
    physics: Phaser.Physics.Arcade.ArcadePhysics;
    cameras: Phaser.Cameras.CameraManager;
  }

  namespace GameObjects {
    class GameObjectFactory {
      graphics(): Graphics;
    }

    class Graphics extends GameObject {
      fillStyle(color: number, alpha?: number): Graphics;
      lineStyle(width: number, color: number, alpha?: number): Graphics;
      fillCircle(x: number, y: number, radius: number): Graphics;
      strokeCircle(x: number, y: number, radius: number): Graphics;
      setPosition(x: number, y: number): Graphics;
      clear(): Graphics;
      destroy(): void;
      beginPath(): Graphics;
      moveTo(x: number, y: number): Graphics;
      lineTo(x: number, y: number): Graphics;
      closePath(): Graphics;
      strokePath(): Graphics;
    }

    class GameObject {
      setPosition(x: number, y: number): GameObject;
    }
  }

  namespace Input {
    class InputPlugin {
      on(event: string, callback: (pointer: Pointer) => void): void;
    }

    class Pointer {
      worldX: number;
      worldY: number;
    }
  }

  namespace Physics {
    namespace Arcade {
      class ArcadePhysics {
        world: Phaser.Physics.Arcade.World;
      }

      class World {
        setBounds(x: number, y: number, width: number, height: number): void;
      }
    }
  }

  namespace Cameras {
    class CameraManager {
      main: Phaser.Cameras.Camera;
    }

    class Camera {
      setBackgroundColor(color: number): void;
    }
  }

  class Game {
    constructor(config: any);
    events: Phaser.Events.EventEmitter;
  }

  namespace Events {
    class EventEmitter {
      once(event: string, callback: () => void): void;
    }
  }
}
