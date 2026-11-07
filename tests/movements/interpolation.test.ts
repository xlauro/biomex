import { describe, expect, test } from "bun:test";
import { MovementRegistry } from "../../src/data/movements/registry";

describe("MovementRegistry", () => {
  test("carrega movimentos cadastrados", () => {
    const all = MovementRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const snatch = MovementRegistry.get("snatch");
    expect(snatch.id).toBe("snatch");
    expect(snatch.keyframes.length).toBe(6);

    const cleanAndJerk = MovementRegistry.get("clean_and_jerk");
    expect(cleanAndJerk.id).toBe("clean_and_jerk");
    expect(cleanAndJerk.keyframes.length).toBe(6);
  });

  test("cada keyframe possui coordenadas de articulações e dados EMG válidos", () => {
    const movements = MovementRegistry.getAll();
    for (const mov of movements) {
      for (const kf of mov.keyframes) {
        expect(kf.joints.ankle).toBeDefined();
        expect(kf.joints.knee).toBeDefined();
        expect(kf.joints.hip).toBeDefined();
        expect(kf.joints.shoulder).toBeDefined();
        expect(kf.joints.elbow).toBeDefined();
        expect(kf.joints.wrist).toBeDefined();

        expect(kf.emg.quads).toBeGreaterThanOrEqual(0);
        expect(kf.emg.quads).toBeLessThanOrEqual(100);
      }
    }
  });
});

import { KinematicsEngine } from "../../src/engine/kinematicsEngine";
import { SNATCH_MOVEMENT } from "../../src/data/movements/snatch";

describe("KinematicsEngine", () => {
  test("interpolação do frame calcula ângulos anatômicos reais e dinâmica", () => {
    const frame = KinematicsEngine.getInterpolatedFrame(SNATCH_MOVEMENT, 0.55, 100, 85);
    expect(frame.progress).toBe(0.55);
    expect(frame.phaseIndex).toBe(3); // Tripla extensão
    expect(frame.angles.knee).toBeGreaterThan(150); // Joelhos quase totalmente estendidos
    expect(frame.dynamics.forceN).toBeGreaterThan(0);
    expect(frame.groundReactionForceRatio).toBeGreaterThan(1.0);
  });

  test("pré-computação da trajetória gera amostras válidas", () => {
    const { trajectory, chartData } = KinematicsEngine.precomputeTrajectory(
      SNATCH_MOVEMENT,
      100,
      85,
      50
    );
    expect(trajectory.length).toBe(51);
    expect(chartData.length).toBe(51);
    expect(chartData[0]?.barHeight).toBeCloseTo(0.22, 1);
  });
});
