import { CoordinateUtils } from "./CoordinateUtils";

describe("CoordinateUtils", () => {
  describe("convertGeoToGameCoordinates", () => {
    it("should properly invert Y-axis for game coordinate system", () => {
      const initialLocation = { latitude: 60.1699, longitude: 24.9384 };
      const geoScale = { metersPerLon: 111320, metersPerLat: 110540 };
      const gameScale = 1;

      // Test moving north (latitude increases)
      const northLocation = {
        latitude: initialLocation.latitude + 0.001,
        longitude: initialLocation.longitude,
      };

      const northCoords = CoordinateUtils.convertGeoToGameCoordinates(
        northLocation,
        initialLocation,
        geoScale,
        gameScale
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
        geoScale,
        gameScale
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
        geoScale,
        gameScale
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
        geoScale,
        gameScale
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

      const coordsScale1 = CoordinateUtils.convertGeoToGameCoordinates(
        testLocation,
        initialLocation,
        geoScale,
        1
      );

      const coordsScale10 = CoordinateUtils.convertGeoToGameCoordinates(
        testLocation,
        initialLocation,
        geoScale,
        10
      );

      // Scale 10 should be 10x larger than scale 1
      expect(coordsScale10.x).toBeCloseTo(coordsScale1.x * 10, 1);
      expect(coordsScale10.y).toBeCloseTo(coordsScale1.y * 10, 1);
    });
  });

  describe("metersToPixels and pixelsToMeters", () => {
    it("should convert between meters and pixels correctly", () => {
      const meters = 100;
      const scale = 20;

      const pixels = CoordinateUtils.metersToPixels(meters, scale);
      expect(pixels).toBe(2000);

      const backToMeters = CoordinateUtils.pixelsToMeters(pixels, scale);
      expect(backToMeters).toBe(meters);
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
