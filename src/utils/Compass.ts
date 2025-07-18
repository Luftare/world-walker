type HeadingCallback = (heading: number) => void;

export class UniversalCompass {
  private headingCallback?: HeadingCallback;
  private listenersAdded = false;
  private permissionGranted = false;

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

    const deviceOrientationEventName =
      "deviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";

    window.addEventListener(
      deviceOrientationEventName,
      this.onDeviceOrientation.bind(this)
    );

    this.listenersAdded = true;
  }

  private onDeviceOrientation(e: any): void {
    if (typeof e.webkitCompassHeading !== "undefined") {
      // iOS Safari
      this.headingCallback?.(e.webkitCompassHeading);
    } else if (typeof e.alpha !== "undefined") {
      // Android Chrome
      let heading = -(e.alpha + (e.beta * e.gamma) / 90);
      heading -= Math.floor(heading / 360) * 360; // Wrap into range [0,360].
      this.headingCallback?.(heading);
    }
    // If neither webkitCompassHeading nor alpha is available, ignore the event
  }
}
