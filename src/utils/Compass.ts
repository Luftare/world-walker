type HeadingCallback = (heading: number) => void;

export class UniversalCompass {
  private headingCallback?: HeadingCallback;
  private listenersAdded = false;

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
    }

    this.addListeners();
  }

  onHeading(callback: HeadingCallback): void {
    this.headingCallback = callback;

    if (!this.listenersAdded) {
      this.addListeners();
    }
  }

  private addListeners() {
    window.addEventListener(
      "deviceorientationabsolute",
      this.onDeviceOrientation.bind(this)
    );
    window.addEventListener(
      "deviceorientation",
      this.onDeviceOrientation.bind(this)
    );
    this.listenersAdded = true;
  }

  private onDeviceOrientation(e: any): void {
    if (typeof e.webkitCompassHeading !== "undefined") {
      // iOS Safari
      this.headingCallback?.(e.webkitCompassHeading);
    } else {
      // Android Chrome
      this.headingCallback?.(360 - e.alpha);
    }
  }
}
