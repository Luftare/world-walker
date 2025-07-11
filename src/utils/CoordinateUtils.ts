export class CoordinateUtils {
  static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    // Calculate distance between two points
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  static metersToPixels(meters: number): number {
    return meters;
  }

  static pixelsToMeters(pixels: number): number {
    return pixels;
  }

  static convertGeoToGameCoordinates(
    geoLocation: { latitude: number; longitude: number },
    initialLocation: { latitude: number; longitude: number },
    geoScale: { metersPerLon: number; metersPerLat: number }
  ): { x: number; y: number } {
    // Calculate offset in degrees
    const lonOffset = geoLocation.longitude - initialLocation.longitude;
    const latOffset = geoLocation.latitude - initialLocation.latitude;

    // Convert to meters
    const xMeters = lonOffset * geoScale.metersPerLon;
    const yMeters = latOffset * geoScale.metersPerLat;

    // Convert meters to pixels
    const xPixels = this.metersToPixels(xMeters);
    // Invert Y-axis for game coordinate system (screen Y increases downward)
    const yPixels = -this.metersToPixels(yMeters);

    return { x: xPixels, y: yPixels };
  }
}
