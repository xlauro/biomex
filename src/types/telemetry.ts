import type { BarDynamics, JointAngles, Joints } from "./kinematics";
import type { EMGMap, MuscleId } from "./muscles";
import type { MovementId } from "./movement";

export interface InterpolatedFrame {
  progress: number;
  timeSec: number;
  phaseIndex: number;
  phaseTitle: string;
  actionType: string;
  phaseDesc: string;
  joints: Joints;
  angles: JointAngles;
  dynamics: BarDynamics;
  emg: EMGMap;
  copX: number;
  groundReactionForceRatio: number; // Múltiplo do peso corporal (ex: 1.5x BW)
}

export interface ChartSample {
  timeSec: number;
  progress: number;
  barHeight: number;
  barVelocity: number;
  barPower: number;
}

export type CameraView = "side" | "front";

export interface SimulatorOptions {
  showBarPath: boolean;
  showAngles: boolean;
  showVectors: boolean;
  showCoP: boolean;
  showGhosts: boolean;
  selectedMuscle: MuscleId | null;
  hoveredMuscle: MuscleId | null;
  barbellWeightKg: number;
  athleteWeightKg: number;
  speed: number;
  cameraView: CameraView;
  movementId: MovementId;
}
