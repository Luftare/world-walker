import { UniversalCompass } from "./Compass";

export class CompassService {
  private compass: UniversalCompass;
  private tracking: boolean = false;
  private currentHeading: number = 0;
  private headingCallback?: (heading: number) => void;

  constructor() {
    this.compass = new UniversalCompass();
  }

  async requestCompassPermission(): Promise<boolean> {
    try {
      await this.compass.requestPermission();
      return true;
    } catch (error) {
      console.error("Compass permission denied:", error);
      return false;
    }
  }

  startCompassTracking(headingCallback: (heading: number) => void): void {
    this.headingCallback = headingCallback;

    this.compass.onHeading((heading: number) => {
      this.currentHeading = heading;
      if (this.headingCallback) {
        this.headingCallback(heading);
      }
    });

    this.tracking = true;
  }

  isTracking(): boolean {
    return this.tracking;
  }

  getCurrentHeading(): number {
    return this.currentHeading;
  }
}
