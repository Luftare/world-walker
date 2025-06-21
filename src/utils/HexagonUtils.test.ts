import { HexagonUtils, HexagonCoord, WorldCoord } from "./HexagonUtils";

describe("HexagonUtils", () => {
  describe("calculateHexagonPoints", () => {
    it("should calculate hexagon points correctly", () => {
      const centerX = 0;
      const centerY = 0;
      const radius = 10;

      const points = HexagonUtils.calculateHexagonPoints(
        centerX,
        centerY,
        radius
      );

      expect(points).toHaveLength(6);

      // Check that all points are at the correct distance from center
      points.forEach((point) => {
        const distance = Math.sqrt(point.x * point.x + point.y * point.y);
        expect(distance).toBeCloseTo(radius, 1);
      });
    });

    it("should use default radius when not provided", () => {
      const points = HexagonUtils.calculateHexagonPoints(0, 0);
      expect(points).toHaveLength(6);
    });
  });

  describe("worldToHexagon", () => {
    it("should convert world coordinates to hexagon coordinates", () => {
      const worldCoord: WorldCoord = { x: 0, y: 0 };
      const hexCoord = HexagonUtils.worldToHexagon(worldCoord.x, worldCoord.y);

      expect(hexCoord).toEqual({ q: 0, r: 0 });
    });

    it("should handle non-zero world coordinates", () => {
      const worldCoord: WorldCoord = { x: 17.32, y: 10 }; // Close to center hexagon
      const hexCoord = HexagonUtils.worldToHexagon(worldCoord.x, worldCoord.y);

      // Should round to nearest hexagon (center hexagon is closest)
      expect(hexCoord.q).toBe(0);
      expect(hexCoord.r).toBe(0);
    });
  });

  describe("hexagonToWorld", () => {
    it("should convert hexagon coordinates to world coordinates", () => {
      const hexCoord: HexagonCoord = { q: 0, r: 0 };
      const worldCoord = HexagonUtils.hexagonToWorld(hexCoord.q, hexCoord.r);

      expect(worldCoord.x).toBeCloseTo(0, 1);
      expect(worldCoord.y).toBeCloseTo(0, 1);
    });

    it("should handle non-zero hexagon coordinates", () => {
      const hexCoord: HexagonCoord = { q: 1, r: 0 };
      const worldCoord = HexagonUtils.hexagonToWorld(hexCoord.q, hexCoord.r);

      expect(worldCoord.x).toBeGreaterThan(0);
      expect(worldCoord.y).toBeCloseTo(0, 1);
    });
  });

  describe("roundHexagon", () => {
    it("should round fractional hexagon coordinates", () => {
      const rounded = HexagonUtils.roundHexagon(0.3, 0.7);
      expect(rounded.q).toBe(0);
      expect(rounded.r).toBe(1);
    });

    it("should handle negative coordinates", () => {
      const rounded = HexagonUtils.roundHexagon(-0.8, -0.2);
      expect(rounded.q).toBe(-1);
      expect(rounded.r).toBe(0);
    });
  });

  describe("getHexagonNeighbors", () => {
    it("should return 6 neighbors for a hexagon", () => {
      const neighbors = HexagonUtils.getHexagonNeighbors(0, 0);

      expect(neighbors).toHaveLength(6);

      // Check that all neighbors are adjacent
      neighbors.forEach((neighbor) => {
        const distance = HexagonUtils.getHexagonDistance(
          { q: 0, r: 0 },
          neighbor
        );
        expect(distance).toBe(1);
      });
    });

    it("should return correct neighbor coordinates", () => {
      const neighbors = HexagonUtils.getHexagonNeighbors(0, 0);

      const expectedNeighbors = [
        { q: 1, r: 0 },
        { q: 1, r: -1 },
        { q: 0, r: -1 },
        { q: -1, r: 0 },
        { q: -1, r: 1 },
        { q: 0, r: 1 },
      ];

      expect(neighbors).toEqual(expect.arrayContaining(expectedNeighbors));
    });
  });

  describe("getHexagonDistance", () => {
    it("should return 0 for same hexagon", () => {
      const hex1: HexagonCoord = { q: 0, r: 0 };
      const hex2: HexagonCoord = { q: 0, r: 0 };

      const distance = HexagonUtils.getHexagonDistance(hex1, hex2);
      expect(distance).toBe(0);
    });

    it("should return 1 for adjacent hexagons", () => {
      const hex1: HexagonCoord = { q: 0, r: 0 };
      const hex2: HexagonCoord = { q: 1, r: 0 };

      const distance = HexagonUtils.getHexagonDistance(hex1, hex2);
      expect(distance).toBe(1);
    });

    it("should return correct distance for non-adjacent hexagons", () => {
      const hex1: HexagonCoord = { q: 0, r: 0 };
      const hex2: HexagonCoord = { q: 2, r: 1 };

      const distance = HexagonUtils.getHexagonDistance(hex1, hex2);
      expect(distance).toBe(3);
    });
  });

  describe("getHexagonsInRange", () => {
    it("should return center hexagon for range 0", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const hexagons = HexagonUtils.getHexagonsInRange(center, 0);

      expect(hexagons).toHaveLength(1);
      expect(hexagons[0]).toEqual(center);
    });

    it("should return correct number of hexagons for range 1", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const hexagons = HexagonUtils.getHexagonsInRange(center, 1);

      expect(hexagons).toHaveLength(7); // Center + 6 neighbors
    });

    it("should return correct number of hexagons for range 2", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const hexagons = HexagonUtils.getHexagonsInRange(center, 2);

      expect(hexagons).toHaveLength(19); // Center + 6 neighbors + 12 at distance 2
    });

    it("should include all hexagons within range", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const hexagons = HexagonUtils.getHexagonsInRange(center, 1);

      hexagons.forEach((hex) => {
        const distance = HexagonUtils.getHexagonDistance(center, hex);
        expect(distance).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("isHexagonInRange", () => {
    it("should return true for hexagon within range", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const target: HexagonCoord = { q: 1, r: 0 };

      const inRange = HexagonUtils.isHexagonInRange(center, target, 1);
      expect(inRange).toBe(true);
    });

    it("should return false for hexagon outside range", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const target: HexagonCoord = { q: 2, r: 0 };

      const inRange = HexagonUtils.isHexagonInRange(center, target, 1);
      expect(inRange).toBe(false);
    });

    it("should return true for hexagon exactly at range boundary", () => {
      const center: HexagonCoord = { q: 0, r: 0 };
      const target: HexagonCoord = { q: 1, r: 0 };

      const inRange = HexagonUtils.isHexagonInRange(center, target, 1);
      expect(inRange).toBe(true);
    });
  });

  describe("coordinate conversion round trip", () => {
    it("should maintain coordinates through world->hex->world conversion", () => {
      const originalWorld: WorldCoord = { x: 0, y: 0 };
      const hexCoord = HexagonUtils.worldToHexagon(
        originalWorld.x,
        originalWorld.y
      );
      const convertedWorld = HexagonUtils.hexagonToWorld(
        hexCoord.q,
        hexCoord.r
      );

      expect(convertedWorld.x).toBeCloseTo(originalWorld.x, 1);
      expect(convertedWorld.y).toBeCloseTo(originalWorld.y, 1);
    });

    it("should maintain coordinates through hex->world->hex conversion", () => {
      const originalHex: HexagonCoord = { q: 1, r: 2 };
      const worldCoord = HexagonUtils.hexagonToWorld(
        originalHex.q,
        originalHex.r
      );
      const convertedHex = HexagonUtils.worldToHexagon(
        worldCoord.x,
        worldCoord.y
      );

      expect(convertedHex.q).toBe(originalHex.q);
      expect(convertedHex.r).toBe(originalHex.r);
    });
  });
});
