import { debugLog } from "./DebugLogger";

type HeadingCallback = (heading: number) => void;

export class UniversalCompass {
  private headingCallback?: HeadingCallback;
  private listenersAdded = false;
  private permissionGranted = false;
  private listenerType = "default";

  async requestPermission(): Promise<void> {
    if (!window.DeviceOrientationEvent) {
      throw new Error("DeviceOrientation API is not available");
    }

    const requestPermissionFn = (DeviceOrientationEvent as any)
      .requestPermission;

    if (typeof requestPermissionFn === "function") {
      const response = await requestPermissionFn();
      if (response !== "granted") {
        throw new Error("Permission for DeviceOrientationEvent not granted");
      }
      this.permissionGranted = true;
    } else {
      // For browsers that don't require explicit permission
      this.permissionGranted = true;
    }

    // Only add listeners after permission is granted
    if (this.permissionGranted && this.headingCallback) {
      this.addListeners();
    }
  }

  onHeading(callback: HeadingCallback): void {
    this.headingCallback = callback;

    // Only add listeners if permission is already granted
    if (this.permissionGranted && !this.listenersAdded) {
      this.addListeners();
    }
  }

  private addListeners() {
    if (this.listenersAdded) return;
    let didRemoveObsoleteListener = false;

    const absoluteListener = (e: any) => {
      // Remove the other listener
      // Android Chrome, Desktop Chrome (no override)
      if (!didRemoveObsoleteListener) {
        window.removeEventListener("deviceorientation", defaultListener);
        didRemoveObsoleteListener = true;
        this.listenerType = "absolute";
      }
      this.onDeviceOrientation(e);
    };

    const defaultListener = (e: any) => {
      // Remove the other listener
      // iOS Safari, Desktop Chrome (override)
      if (!didRemoveObsoleteListener) {
        window.removeEventListener(
          "deviceorientationabsolute",
          absoluteListener
        );
        didRemoveObsoleteListener = true;
        this.listenerType = "default";
      }
      debugLog("defaultListener");
      this.onDeviceOrientation(e);
    };

    window.addEventListener("deviceorientation", defaultListener);
    setTimeout(() => {
      window.addEventListener("deviceorientationabsolute", absoluteListener);
    }, 1000);
    this.listenersAdded = true;
  }

  private onDeviceOrientation(e: any): void {
    if (typeof e.webkitCompassHeading !== "undefined") {
      // iOS Safari
      debugLog("webkitCompassHeading + " + this.listenerType);
      this.headingCallback?.(e.webkitCompassHeading);
    } else if (typeof e.alpha !== "undefined") {
      // Android Chrome
      const heading = 360 - e.alpha;
      debugLog("alpha + " + this.listenerType);
      this.headingCallback?.(heading);
    }
    // If neither webkitCompassHeading nor alpha is available, ignore the event
  }
}
