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

  static metersToPixels(meters: number, scale: number): number {
    // Convert meters to pixels using the game scale
    return meters * scale;
  }

  static pixelsToMeters(pixels: number, scale: number): number {
    // Convert pixels to meters using the game scale
    return pixels / scale;
  }

  static convertGeoToGameCoordinates(
    geoLocation: { latitude: number; longitude: number },
    initialLocation: { latitude: number; longitude: number },
    geoScale: { metersPerLon: number; metersPerLat: number },
    gameScale: number
  ): { x: number; y: number } {
    // Calculate offset in degrees
    const lonOffset = geoLocation.longitude - initialLocation.longitude;
    const latOffset = geoLocation.latitude - initialLocation.latitude;

    // Convert to meters
    const xMeters = lonOffset * geoScale.metersPerLon;
    const yMeters = latOffset * geoScale.metersPerLat;

    // Convert meters to pixels
    const xPixels = this.metersToPixels(xMeters, gameScale);
    const yPixels = this.metersToPixels(yMeters, gameScale);

    return { x: xPixels, y: yPixels };
  }
}
