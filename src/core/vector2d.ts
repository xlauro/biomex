import type { Point2D } from "../types/kinematics";

export class Vector2D {
  static create(x: number = 0, y: number = 0): Point2D {
    return { x, y };
  }

  static clone(p: Point2D): Point2D {
    return { x: p.x, y: p.y };
  }

  static add(a: Point2D, b: Point2D): Point2D {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static sub(a: Point2D, b: Point2D): Point2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static scale(v: Point2D, s: number): Point2D {
    return { x: v.x * s, y: v.y * s };
  }

  static dot(a: Point2D, b: Point2D): number {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Point2D, b: Point2D): number {
    return a.x * b.y - a.y * b.x;
  }

  static length(v: Point2D): number {
    return Math.hypot(v.x, v.y);
  }

  static distance(a: Point2D, b: Point2D): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  static normalize(v: Point2D): Point2D {
    const len = Vector2D.length(v);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static lerpPoint(p1: Point2D, p2: Point2D, t: number): Point2D {
    return {
      x: Vector2D.lerp(p1.x, p2.x, t),
      y: Vector2D.lerp(p1.y, p2.y, t),
    };
  }

  /**
   * Calcula o ângulo interno em graus formado pelas retas (p1 -> center) e (p2 -> center)
   * Útil para ângulos articulares anatômicos como Joelho e Cotovelo.
   */
  static jointAngle(p1: Point2D, center: Point2D, p2: Point2D): number {
    const v1 = Vector2D.sub(p1, center);
    const v2 = Vector2D.sub(p2, center);
    const len1 = Vector2D.length(v1);
    const len2 = Vector2D.length(v2);

    if (len1 === 0 || len2 === 0) return 180;

    const cosTheta = Vector2D.dot(v1, v2) / (len1 * len2);
    // Limita entre -1 e 1 para evitar NaN devido a erros de ponto flutuante
    const clampedCos = Math.max(-1, Math.min(1, cosTheta));
    return (Math.acos(clampedCos) * 180) / Math.PI;
  }

  /**
   * Calcula o ângulo do segmento (pStart -> pEnd) em relação ao eixo horizontal positivo (em graus)
   */
  static angleToHorizontal(pStart: Point2D, pEnd: Point2D): number {
    const dx = pEnd.x - pStart.x;
    const dy = pEnd.y - pStart.y;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }
}
