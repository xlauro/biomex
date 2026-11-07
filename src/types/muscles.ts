export type MuscleId =
  | "quads"
  | "glutes"
  | "hamstrings"
  | "erectors"
  | "lats"
  | "traps"
  | "delts"
  | "core"
  | "calves"
  | "arms";

export type EMGMap = Record<MuscleId, number>;

export interface MuscleGroup {
  id: MuscleId;
  name: string;
  subtitle: string;
  roleByPhase: string[];
}
