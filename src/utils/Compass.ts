type HeadingCallback = (heading: number) => void;

export class UniversalCompass {
  private headingCallback?: HeadingCallback;
  private listenersAdded = false;
  private permissionGranted = false;
  private headingBuffer: number[] = [];
  private readonly BUFFER_SIZE = 5;
  private readonly MAX_DELTA = 30;

  // DEBUG: Getter for heading buffer to visualize in UI
  getHeadingBuffer(): number[] {
    return [...this.headingBuffer];
  }

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

    const absoluteListener = (e: any) => {
      // Remove the other listener
      window.removeEventListener("deviceorientation", defaultListener);
      this.onDeviceOrientation(e);
    };

    const defaultListener = (e: any) => {
      // Remove the other listener
      window.removeEventListener("deviceorientationabsolute", absoluteListener);
      this.onDeviceOrientation(e);
    };

    window.addEventListener("deviceorientation", defaultListener);
    window.addEventListener("deviceorientationabsolute", absoluteListener);
    this.listenersAdded = true;
  }

  private getMedian(headings: number[]): number {
    if (headings.length === 0) return 0;

    const sorted = [...headings].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1]! + sorted[mid]!) / 2
      : sorted[mid]!;
  }

  private getDelta(heading1: number, heading2: number): number {
    let delta = Math.abs(heading1 - heading2);
    if (delta > 180) {
      delta = 360 - delta;
    }
    return delta;
  }

  private onDeviceOrientation(e: any): void {
    if (typeof e.webkitCompassHeading !== "undefined") {
      // iOS Safari - no filtering needed
      this.headingCallback?.(e.webkitCompassHeading);
    } else if (typeof e.alpha !== "undefined") {
      // Android Chrome - apply median filter
      const heading = 360 - e.alpha;
      this.headingBuffer.push(heading);

      if (this.headingBuffer.length > this.BUFFER_SIZE) {
        this.headingBuffer.shift();
      }

      if (this.headingBuffer.length >= 3) {
        const median = this.getMedian(this.headingBuffer);
        const delta = this.getDelta(heading, median);

        if (delta <= this.MAX_DELTA) {
          this.headingCallback?.(heading);
        }
      } else {
        // Not enough data yet, pass through
        this.headingCallback?.(heading);
      }
    }
    // If neither webkitCompassHeading nor alpha is available, ignore the event
  }
}
