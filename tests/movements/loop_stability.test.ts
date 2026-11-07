import { describe, expect, test } from "bun:test";
import { KinematicsEngine } from "../../src/engine/kinematicsEngine";
import { SNATCH_MOVEMENT } from "../../src/data/movements/snatch";
import { CLEAN_AND_JERK_MOVEMENT } from "../../src/data/movements/cleanAndJerk";

describe("Loop & Boundary Stability", () => {
  test("getInterpolatedFrame não quebra com progress além dos limites (progress > 1.0 ou < 0)", () => {
    // Casos limites após o lockout
    const framePost = KinematicsEngine.getInterpolatedFrame(SNATCH_MOVEMENT, 1.05, 100, 85);
    expect(framePost.progress).toBe(1.0);
    expect(framePost.joints.wrist).toBeDefined();
    expect(framePost.joints.wrist.x).not.toBeNaN();
    expect(framePost.joints.wrist.y).not.toBeNaN();

    const framePre = KinematicsEngine.getInterpolatedFrame(SNATCH_MOVEMENT, -0.1, 100, 85);
    expect(framePre.progress).toBe(0.0);
    expect(framePre.joints.wrist).toBeDefined();
  });

  test("amostras de velocidade são seguras em qualquer valor de progresso", () => {
    const vEnd = KinematicsEngine.sampleBarVelocity(SNATCH_MOVEMENT, 1.06);
    expect(vEnd).not.toBeNaN();
    const vClean = KinematicsEngine.sampleBarVelocity(CLEAN_AND_JERK_MOVEMENT, 1.2);
    expect(vClean).not.toBeNaN();
  });

  test("trajetória e gráficos indexam com segurança além de 100%", () => {
    const { trajectory, chartData } = KinematicsEngine.precomputeTrajectory(SNATCH_MOVEMENT, 100, 85, 160);
    expect(trajectory.length).toBe(161);
    expect(chartData.length).toBe(161);

    // Simula a indexação que causava crash quando progress = 1.05
    const progress = 1.05;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const maxIdx = Math.min(trajectory.length - 1, Math.floor(clampedProgress * (trajectory.length - 1)));
    expect(maxIdx).toBe(160);
    expect(trajectory[maxIdx]).toBeDefined();
    expect(trajectory[maxIdx]?.x).toBeDefined();
  });
});
