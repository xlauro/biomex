import { describe, expect, test } from "bun:test";
import { Vector2D } from "../../src/core/vector2d";

describe("Vector2D", () => {
  test("operações básicas: adição, subtração e escala", () => {
    const a = { x: 3, y: 4 };
    const b = { x: 1, y: 2 };

    const add = Vector2D.add(a, b);
    expect(add).toEqual({ x: 4, y: 6 });

    const sub = Vector2D.sub(a, b);
    expect(sub).toEqual({ x: 2, y: 2 });

    const scale = Vector2D.scale(a, 2);
    expect(scale).toEqual({ x: 6, y: 8 });
  });

  test("cálculo de magnitude e distância euclidiana", () => {
    const v = { x: 3, y: 4 };
    expect(Vector2D.length(v)).toBe(5);

    const p1 = { x: 1, y: 1 };
    const p2 = { x: 4, y: 5 };
    expect(Vector2D.distance(p1, p2)).toBe(5);
  });

  test("normalização e produto escalar", () => {
    const v = { x: 0, y: 10 };
    const norm = Vector2D.normalize(v);
    expect(norm.x).toBe(0);
    expect(norm.y).toBe(1);

    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 1 };
    expect(Vector2D.dot(a, b)).toBe(0); // Perpendiculares
  });

  test("cálculo de ângulo articular anatômico", () => {
    // Joelho a 90 graus: quadril (0, 1), joelho (0, 0), tornozelo (1, 0)
    const hip = { x: 0, y: 1 };
    const knee = { x: 0, y: 0 };
    const ankle = { x: 1, y: 0 };

    const angle = Vector2D.jointAngle(hip, knee, ankle);
    expect(Math.round(angle)).toBe(90);

    // Linha reta (extensão 180 graus): (0, 1) -> (0, 0) -> (0, -1)
    const ankleStraight = { x: 0, y: -1 };
    const straightAngle = Vector2D.jointAngle(hip, knee, ankleStraight);
    expect(Math.round(straightAngle)).toBe(180);
  });
});
