import { UniversalCompass } from "universal-compass";

export class CompassService {
  private compass: UniversalCompass;
  private tracking: boolean = false;
  private currentHeading: number = 0;
  private headingCallback?: (heading: number) => void;
  private errorCallback?: (error: string) => void;

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

  startCompassTracking(
    headingCallback: (heading: number) => void,
    errorCallback?: (error: string) => void
  ): void {
    this.headingCallback = headingCallback;
    if (errorCallback !== undefined) {
      this.errorCallback = errorCallback;
    }

    this.compass.onHeading((heading: number) => {
      this.currentHeading = heading;
      if (this.headingCallback) {
        this.headingCallback(heading);
      }
    });

    this.tracking = true;
  }

  stopCompassTracking(): void {
    this.compass.stop();
    this.tracking = false;
    delete this.headingCallback;
    delete this.errorCallback;
  }

  isTracking(): boolean {
    return this.tracking;
  }

  getCurrentHeading(): number {
    return this.currentHeading;
  }
}
