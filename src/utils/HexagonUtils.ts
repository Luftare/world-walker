import { gameConfig } from "../config/gameConfig";

export interface HexagonCoord {
  q: number; // Column (axial coordinate)
  r: number; // Row (axial coordinate)
}

export interface WorldCoord {
  x: number;
  y: number;
}

export class HexagonUtils {
  static readonly HEXAGON_ANGLE = Math.PI / 3; // 60 degrees
  static readonly HEXAGON_RADIUS = gameConfig.hexagonRadius * gameConfig.scale;

  static calculateHexagonPoints(
    centerX: number,
    centerY: number,
    radius: number = this.HEXAGON_RADIUS,
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = i * this.HEXAGON_ANGLE + Math.PI / 2;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return points;
  }

  static worldToHexagon(x: number, y: number): HexagonCoord {
    const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / this.HEXAGON_RADIUS;
    const r = ((2 / 3) * y) / this.HEXAGON_RADIUS;
    return this.roundHexagon(q, r);
  }

  static hexagonToWorld(q: number, r: number): WorldCoord {
    const x = this.HEXAGON_RADIUS * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = this.HEXAGON_RADIUS * ((3 / 2) * r);
    return { x, y };
  }

  static roundHexagon(q: number, r: number): HexagonCoord {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }

    return { q: rq, r: rr };
  }

  static getHexagonNeighbors(q: number, r: number): HexagonCoord[] {
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ];

    return directions.map((dir) => ({
      q: q + dir.q,
      r: r + dir.r,
    }));
  }

  static getHexagonDistance(hex1: HexagonCoord, hex2: HexagonCoord): number {
    return (
      (Math.abs(hex1.q - hex2.q) +
        Math.abs(hex1.q + hex1.r - hex2.q - hex2.r) +
        Math.abs(hex1.r - hex2.r)) /
      2
    );
  }

  static getHexagonsInRange(
    center: HexagonCoord,
    range: number,
  ): HexagonCoord[] {
    const hexagons: HexagonCoord[] = [];

    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);

      for (let r = r1; r <= r2; r++) {
        hexagons.push({
          q: center.q + q,
          r: center.r + r,
        });
      }
    }

    return hexagons;
  }

  static isHexagonInRange(
    center: HexagonCoord,
    target: HexagonCoord,
    range: number,
  ): boolean {
    return this.getHexagonDistance(center, target) <= range;
  }
}
