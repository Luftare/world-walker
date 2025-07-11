import { CoordinateUtils } from "./CoordinateUtils";

describe("CoordinateUtils", () => {
  describe("convertGeoToGameCoordinates", () => {
    it("should properly invert Y-axis for game coordinate system", () => {
      const initialLocation = { latitude: 60.1699, longitude: 24.9384 };
      const geoScale = { metersPerLon: 111320, metersPerLat: 110540 };

      // Test moving north (latitude increases)
      const northLocation = {
        latitude: initialLocation.latitude + 0.001,
        longitude: initialLocation.longitude,
      };

      const northCoords = CoordinateUtils.convertGeoToGameCoordinates(
        northLocation,
        initialLocation,
        geoScale
      );

      // Y should be negative (inverted) when moving north
      expect(northCoords.y).toBeLessThan(0);
      expect(northCoords.x).toBeCloseTo(0, 1);

      // Test moving south (latitude decreases)
      const southLocation = {
        latitude: initialLocation.latitude - 0.001,
        longitude: initialLocation.longitude,
      };

      const southCoords = CoordinateUtils.convertGeoToGameCoordinates(
        southLocation,
        initialLocation,
        geoScale
      );

      // Y should be positive (inverted) when moving south
      expect(southCoords.y).toBeGreaterThan(0);
      expect(southCoords.x).toBeCloseTo(0, 1);

      // Test moving east (longitude increases)
      const eastLocation = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude + 0.001,
      };

      const eastCoords = CoordinateUtils.convertGeoToGameCoordinates(
        eastLocation,
        initialLocation,
        geoScale
      );

      // X should be positive when moving east
      expect(eastCoords.x).toBeGreaterThan(0);
      expect(eastCoords.y).toBeCloseTo(0, 1);

      // Test moving west (longitude decreases)
      const westLocation = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude - 0.001,
      };

      const westCoords = CoordinateUtils.convertGeoToGameCoordinates(
        westLocation,
        initialLocation,
        geoScale
      );

      // X should be negative when moving west
      expect(westCoords.x).toBeLessThan(0);
      expect(westCoords.y).toBeCloseTo(0, 1);
    });

    it("should handle scale conversion correctly", () => {
      const initialLocation = { latitude: 60.1699, longitude: 24.9384 };
      const geoScale = { metersPerLon: 111320, metersPerLat: 110540 };
      const testLocation = {
        latitude: initialLocation.latitude + 0.001,
        longitude: initialLocation.longitude + 0.001,
      };

      const coords = CoordinateUtils.convertGeoToGameCoordinates(
        testLocation,
        initialLocation,
        geoScale
      );

      // Should return coordinates in meters (no scale applied)
      expect(coords.x).toBeCloseTo(111.32, 1);
      expect(coords.y).toBeCloseTo(-110.54, 1);
    });
  });

  describe("calculateDistance", () => {
    it("should calculate distance between two points correctly", () => {
      const distance = CoordinateUtils.calculateDistance(0, 0, 3, 4);
      expect(distance).toBe(5);
    });

    it("should return 0 for same point", () => {
      const distance = CoordinateUtils.calculateDistance(1, 2, 1, 2);
      expect(distance).toBe(0);
    });
  });
});
