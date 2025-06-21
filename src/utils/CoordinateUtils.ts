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
}
