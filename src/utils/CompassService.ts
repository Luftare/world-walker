import { UniversalCompass } from "./Compass";

export class CompassService {
  private compass: UniversalCompass;
  private tracking: boolean = false;
  private currentHeading: number = 0;
  private headingCallback?: (heading: number) => void;
  private permissionGranted: boolean = false;

  constructor() {
    this.compass = new UniversalCompass();
  }

  async requestCompassPermission(): Promise<boolean> {
    try {
      await this.compass.requestPermission();
      this.permissionGranted = true;
      return true;
    } catch (error) {
      console.error("Compass permission denied:", error);
      return false;
    }
  }

  startCompassTracking(headingCallback: (heading: number) => void): void {
    this.headingCallback = headingCallback;

    // Only start tracking if permission is granted
    if (!this.permissionGranted) {
      console.warn("Compass permission not granted. Cannot start tracking.");
      return;
    }

    this.compass.onHeading((heading: number) => {
      this.currentHeading = heading;
      if (this.headingCallback) {
        this.headingCallback(heading);
      }
    });

    this.tracking = true;
  }

  updateHeadingCallback(headingCallback: (heading: number) => void): void {
    this.headingCallback = headingCallback;
  }

  isTracking(): boolean {
    return this.tracking && this.permissionGranted;
  }

  getCurrentHeading(): number {
    return this.currentHeading;
  }

  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }
}
