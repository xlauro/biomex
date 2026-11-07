import { describe, expect, test } from "bun:test";
import { PhysicsEngine } from "../../src/core/physics";

describe("PhysicsEngine", () => {
  test("cálculo de força vertical da barra estática", () => {
    const barMass = 100; // 100kg
    const forceStatic = PhysicsEngine.calculateBarForce(barMass, 0);
    // F = m * g = 100 * 9.81 = 981 N
    expect(Math.round(forceStatic)).toBe(981);
  });

  test("cálculo de força com aceleração vertical positiva", () => {
    const barMass = 100;
    const accel = 5.0; // 5 m/s²
    const forceAccelerating = PhysicsEngine.calculateBarForce(barMass, accel);
    // F = 100 * (9.81 + 5) = 1481 N
    expect(Math.round(forceAccelerating)).toBe(1481);
  });

  test("cálculo de potência mecânica instantânea em Watts", () => {
    const force = 1481; // N
    const velocity = 2.0; // m/s
    const power = PhysicsEngine.calculatePower(force, velocity);
    // P = F * v = 1481 * 2 = 2962 Watts
    expect(power).toBe(2962);
  });

  test("distribuição correta de anilhas olímpicas IWF", () => {
    // 120kg total: barra de 20kg + 50kg por manga
    // 50kg por manga = 2x 25kg vermelhas
    const plates120 = PhysicsEngine.getPlatesPerSleeve(120);
    expect(plates120.length).toBe(2);
    expect(plates120[0]?.weightKg).toBe(25);
    expect(plates120[1]?.weightKg).toBe(25);

    // 70kg total: barra 20kg + 25kg por manga = 1x 25kg
    const plates70 = PhysicsEngine.getPlatesPerSleeve(70);
    expect(plates70.length).toBe(1);
    expect(plates70[0]?.weightKg).toBe(25);

    // 185kg total: barra 20kg + 82.5kg por manga
    // 82.5kg = 3x 25kg (75kg) + 1x 5kg (80kg) + 1x 2.5kg (82.5kg)
    const plates185 = PhysicsEngine.getPlatesPerSleeve(185);
    expect(plates185.map((p) => p.weightKg)).toEqual([25, 25, 25, 5, 2.5]);
  });
});
