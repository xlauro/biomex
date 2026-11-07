import type { Point2D } from "../types/kinematics";
import { Vector2D } from "./vector2d";

export class Spline {
  /**
   * Fator de suavização híbrido (smoothstep com peso linear)
   */
  static smoothStep(t: number): number {
    const clampedT = Math.max(0, Math.min(1, t));
    const s = clampedT * clampedT * (3 - 2 * clampedT);
    return Vector2D.lerp(clampedT, s, 0.55);
  }

  /**
   * Interpolação Catmull-Rom 1D
   */
  static catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;

    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    );
  }

  /**
   * Interpolação Catmull-Rom 2D para pontos
   */
  static catmullRom2D(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    t: number
  ): Point2D {
    return {
      x: Spline.catmullRom1D(p0.x, p1.x, p2.x, p3.x, t),
      y: Spline.catmullRom1D(p0.y, p1.y, p2.y, p3.y, t),
    };
  }
}
