import type { Joints } from "./kinematics";
import type { EMGMap } from "./muscles";

export type MovementId = "snatch" | "clean_and_jerk";

export interface MovementKeyframe {
  progress: number;       // 0.0 a 1.0
  phaseIndex: number;     // 0 a N
  title: string;
  actionType: string;
  desc: string;
  joints: Joints;
  emg: EMGMap;
  copX?: number;          // Centro de pressão no eixo X (-0.1 a +0.1 em metros do calcanhar)
  targetVelocity?: number; // Velocidade vertical de referência da barra (m/s)
}

export interface MovementPhase {
  index: number;
  name: string;
  shortName: string;
  progress: number;
}

export interface Movement {
  id: MovementId;
  name: string;
  description: string;
  defaultDurationSec: number;
  phases: MovementPhase[];
  keyframes: MovementKeyframe[];
}
