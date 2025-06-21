export class HexagonUtils {
  static calculateHexagonPoints(
    centerX: number,
    centerY: number,
    radius: number
  ): Array<{ x: number; y: number }> {
    // Calculate hexagon corner points
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return points;
  }
}
