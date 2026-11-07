import type { Movement, MovementKeyframe } from "../types/movement";
import type { InterpolatedFrame, ChartSample } from "../types/telemetry";
import type { Joints, JointAngles, BarDynamics } from "../types/kinematics";
import type { EMGMap, MuscleId } from "../types/muscles";
import { Vector2D } from "../core/vector2d";
import { Spline } from "../core/spline";
import { PhysicsEngine } from "../core/physics";

export interface TrajectoryPoint {
  progress: number;
  timeSec: number;
  x: number;
  y: number;
  velocity: number;
  power: number;
}

export class KinematicsEngine {
  /**
   * Retorna o estado interpolado completo para um progresso p (0.0 a 1.0)
   */
  static getInterpolatedFrame(
    movement: Movement,
    progress: number,
    barbellWeightKg: number,
    athleteWeightKg: number
  ): InterpolatedFrame {
    const p = Math.max(0, Math.min(1, progress));
    const kfs = movement.keyframes;
    const duration = movement.defaultDurationSec;
    const timeSec = p * duration;

    // Localizar keyframes vizinhos
    let k0 = kfs[0]!;
    let k1 = kfs[kfs.length - 1]!;

    for (let i = 0; i < kfs.length - 1; i++) {
      if (p >= kfs[i]!.progress && p <= kfs[i + 1]!.progress) {
        k0 = kfs[i]!;
        k1 = kfs[i + 1]!;
        break;
      }
    }

    const span = k1.progress - k0.progress || 1;
    const rawT = (p - k0.progress) / span;
    const t = Spline.smoothStep(rawT);

    // Interpolação das articulações
    const joints: Joints = {
      ankle: Vector2D.lerpPoint(k0.joints.ankle, k1.joints.ankle, t),
      knee: Vector2D.lerpPoint(k0.joints.knee, k1.joints.knee, t),
      hip: Vector2D.lerpPoint(k0.joints.hip, k1.joints.hip, t),
      shoulder: Vector2D.lerpPoint(k0.joints.shoulder, k1.joints.shoulder, t),
      elbow: Vector2D.lerpPoint(k0.joints.elbow, k1.joints.elbow, t),
      wrist: Vector2D.lerpPoint(k0.joints.wrist, k1.joints.wrist, t),
      head: Vector2D.lerpPoint(k0.joints.head, k1.joints.head, t),
    };

    // Interpolação da perna traseira na fase de tesoura (Split Jerk)
    if (k0.joints.rearLeg || k1.joints.rearLeg) {
      const r0 = k0.joints.rearLeg ?? { ankle: k0.joints.ankle, knee: k0.joints.knee };
      const r1 = k1.joints.rearLeg ?? { ankle: k1.joints.ankle, knee: k1.joints.knee };
      joints.rearLeg = {
        ankle: Vector2D.lerpPoint(r0.ankle, r1.ankle, t),
        knee: Vector2D.lerpPoint(r0.knee, r1.knee, t),
      };
    }

    // Cálculos reais de ângulos anatômicos por vetores
    const kneeAngle = Math.round(Vector2D.jointAngle(joints.ankle, joints.knee, joints.hip));
    const hipAngle = Math.round(Vector2D.jointAngle(joints.knee, joints.hip, joints.shoulder));
    const elbowAngle = Math.round(Vector2D.jointAngle(joints.shoulder, joints.elbow, joints.wrist));
    const trunkAngle = Math.round(Vector2D.angleToHorizontal(joints.hip, joints.shoulder));
    const shoulderAngle = Math.round(Vector2D.jointAngle(joints.hip, joints.shoulder, joints.elbow));
    const ankleAngle = Math.round(Vector2D.angleToHorizontal(joints.ankle, joints.knee));

    const angles: JointAngles = {
      knee: kneeAngle,
      hip: hipAngle,
      elbow: elbowAngle,
      trunk: trunkAngle,
      shoulder: shoulderAngle,
      ankle: ankleAngle,
    };

    // Interpolação EMG
    const emg: EMGMap = {} as EMGMap;
    for (const key of Object.keys(k0.emg) as MuscleId[]) {
      emg[key] = Math.round(Vector2D.lerp(k0.emg[key], k1.emg[key], t));
    }

    // Interpolação Centro de Pressão (CoP)
    const cop0 = k0.copX ?? 0.02;
    const cop1 = k1.copX ?? 0.02;
    const copX = Vector2D.lerp(cop0, cop1, t);

    // Dinâmica da barra
    const velocity = KinematicsEngine.sampleBarVelocity(movement, p);

    // Aceleração dv / dt com delta de 25ms
    const dt = 0.025;
    const dp = dt / duration;
    const vPrev = KinematicsEngine.sampleBarVelocity(movement, Math.max(0, p - dp));
    const acceleration = (velocity - vPrev) / dt;

    // Força vertical total em Newtons (m * (g + a))
    const forceN = Math.max(0, barbellWeightKg * (PhysicsEngine.GRAVITY + acceleration));
    const powerWatts = PhysicsEngine.calculatePower(forceN, velocity);
    const workJoules = Math.max(0, forceN * (joints.wrist.y - 0.22));

    const dynamics: BarDynamics = {
      heightM: joints.wrist.y,
      velocity,
      acceleration,
      forceN,
      powerWatts,
      workJoules,
    };

    const groundReactionForceRatio = PhysicsEngine.calculateGroundReactionRatio(
      athleteWeightKg,
      barbellWeightKg,
      acceleration
    );

    const activeKf: MovementKeyframe = rawT < 0.5 ? k0 : k1;

    return {
      progress: p,
      timeSec,
      phaseIndex: activeKf.phaseIndex,
      phaseTitle: activeKf.title,
      actionType: activeKf.actionType,
      phaseDesc: activeKf.desc,
      joints,
      angles,
      dynamics,
      emg,
      copX,
      groundReactionForceRatio,
    };
  }

  /**
   * Amostra a velocidade da barra interpolada de forma contínua
   */
  public static sampleBarVelocity(movement: Movement, p: number): number {
    const clampedP = Math.max(0, Math.min(1, p));
    const kfs = movement.keyframes;
    let k0 = kfs[0]!;
    let k1 = kfs[kfs.length - 1]!;

    for (let i = 0; i < kfs.length - 1; i++) {
      if (clampedP >= kfs[i]!.progress && clampedP <= kfs[i + 1]!.progress) {
        k0 = kfs[i]!;
        k1 = kfs[i + 1]!;
        break;
      }
    }
    const span = k1.progress - k0.progress || 1;
    const t = Spline.smoothStep((clampedP - k0.progress) / span);
    const v0 = k0.targetVelocity ?? 0;
    const v1 = k1.targetVelocity ?? 0;
    return Vector2D.lerp(v0, v1, t);
  }

  /**
   * Pré-calcula a trajetória completa da barra e curvas de gráficos para o movimento
   */
  static precomputeTrajectory(
    movement: Movement,
    barbellWeightKg: number,
    athleteWeightKg: number,
    samplesCount: number = 160
  ): { trajectory: TrajectoryPoint[]; chartData: ChartSample[] } {
    const trajectory: TrajectoryPoint[] = [];
    const chartData: ChartSample[] = [];

    for (let i = 0; i <= samplesCount; i++) {
      const p = i / samplesCount;
      const frame = KinematicsEngine.getInterpolatedFrame(
        movement,
        p,
        barbellWeightKg,
        athleteWeightKg
      );

      trajectory.push({
        progress: p,
        timeSec: frame.timeSec,
        x: frame.joints.wrist.x,
        y: frame.joints.wrist.y,
        velocity: frame.dynamics.velocity,
        power: frame.dynamics.powerWatts,
      });

      chartData.push({
        timeSec: frame.timeSec,
        progress: p,
        barHeight: frame.dynamics.heightM,
        barVelocity: frame.dynamics.velocity,
        barPower: frame.dynamics.powerWatts,
      });
    }

    return { trajectory, chartData };
  }
}
