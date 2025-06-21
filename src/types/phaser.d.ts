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
      text(x: number, y: number, text: string, style?: any): Text;
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
      setVisible(visible: boolean): Graphics;
    }

    class Text extends GameObject {
      setText(text: string): Text;
      setScrollFactor(x: number, y?: number): Text;
      setDepth(depth: number): Text;
      setVisible(visible: boolean): Text;
      destroy(): void;
    }

    class GameObject {
      setPosition(x: number, y: number): GameObject;
    }
  }

  namespace Input {
    class InputPlugin {
      on(event: string, callback: (pointer: Pointer) => void): void;
      keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
    }

    class Pointer {
      worldX: number;
      worldY: number;
    }

    namespace Keyboard {
      class KeyboardPlugin {
        addKey(key: string): Key;
      }

      class Key {
        isDown: boolean;
        on(event: string, callback: () => void): void;
      }

      function JustDown(key: Key): boolean;
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
      centerOn(x: number, y: number): void;
      setZoom(zoom: number): void;
      setRotation(rotation: number): void;
      setBounds(x: number, y: number, width: number, height: number): void;
      removeBounds(): void;
      shake(duration: number, intensity: number): void;
      flash(duration: number, red: number, green: number, blue: number): void;
      scrollX: number;
      scrollY: number;
      width: number;
      height: number;
      zoom: number;
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
