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

  static convertGeoToGameCoordinates(
    geoLocation: { latitude: number; longitude: number },
    initialLocation: { latitude: number; longitude: number },
    geoScale: { metersPerLon: number; metersPerLat: number }
  ): { x: number; y: number } {
    // Calculate offset in degrees
    const lonOffset = geoLocation.longitude - initialLocation.longitude;
    const latOffset = geoLocation.latitude - initialLocation.latitude;

    // Convert to meters (1:1 mapping with pixels)
    const xMeters = lonOffset * geoScale.metersPerLon;
    const yMeters = latOffset * geoScale.metersPerLat;

    // Invert Y-axis for game coordinate system (screen Y increases downward)
    const yMetersInverted = -yMeters;

    return { x: xMeters, y: yMetersInverted };
  }
}
