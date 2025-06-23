import { CoordinateUtils } from "./CoordinateUtils";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeoScale {
  metersPerLon: number;
  metersPerLat: number;
}

export class GeolocationService {
  private watchId: number | null = null;
  private initialLocation: GeoLocation | null = null;
  private geoScale: GeoScale | null = null;
  private onLocationUpdate: ((x: number, y: number) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  async requestLocationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("geolocation" in window.navigator)) {
      throw new Error("Geolocation is not supported by this browser");
    }

    return new Promise((resolve) => {
      window.navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (_error) => resolve(false),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  async getInitialLocation(): Promise<GeoLocation> {
    if (typeof window === "undefined" || !("geolocation" in window.navigator)) {
      throw new Error("Geolocation is not supported by this browser");
    }

    return new Promise((resolve, reject) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.initialLocation = location;
          this.calculateGeoScale(location);
          resolve(location);
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private calculateGeoScale(location: GeoLocation): void {
    // Calculate meters per degree at the given latitude
    // This is a simplified approximation that works well for most latitudes
    const latRad = (location.latitude * Math.PI) / 180;
    const earthRadius = 6371000; // Earth's radius in meters

    // Meters per degree of longitude (varies with latitude)
    const metersPerLon = (Math.PI * earthRadius * Math.cos(latRad)) / 180;

    // Meters per degree of latitude (constant)
    const metersPerLat = (Math.PI * earthRadius) / 180;

    this.geoScale = { metersPerLon, metersPerLat };
  }

  startLocationTracking(
    onLocationUpdate: (x: number, y: number) => void,
    onError: (error: string) => void
  ): void {
    if (typeof window === "undefined" || !("geolocation" in window.navigator)) {
      onError("Geolocation is not supported by this browser");
      return;
    }

    if (!this.initialLocation || !this.geoScale) {
      onError("Initial location not set. Call getInitialLocation() first.");
      return;
    }

    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;

    this.watchId = window.navigator.geolocation.watchPosition(
      (position) => {
        const currentLocation: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        const gameCoordinates = this.convertToGameCoordinates(currentLocation);
        this.onLocationUpdate?.(gameCoordinates.x, gameCoordinates.y);
        console.log("Location update", gameCoordinates);
      },
      (error) => {
        this.onError?.(`Location tracking error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 99999999999, maximumAge: 3000 }
    );
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      window.navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.onLocationUpdate = null;
    this.onError = null;
  }

  private convertToGameCoordinates(location: GeoLocation): {
    x: number;
    y: number;
  } {
    if (!this.initialLocation || !this.geoScale) {
      throw new Error("Initial location or geo scale not set");
    }

    // Use CoordinateUtils for consistent coordinate conversion with Y-axis inversion
    return CoordinateUtils.convertGeoToGameCoordinates(
      location,
      this.initialLocation,
      this.geoScale,
      1 // Return coordinates in meters, GameScene will convert to pixels
    );
  }

  getInitialLocationData(): {
    location: GeoLocation | null;
    scale: GeoScale | null;
  } {
    return {
      location: this.initialLocation,
      scale: this.geoScale,
    };
  }

  isTracking(): boolean {
    return this.watchId !== null;
  }
}
