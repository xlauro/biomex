import type { CameraView, SimulatorOptions } from "../types/telemetry";
import type { MuscleId } from "../types/muscles";
import type { MovementId } from "../types/movement";

export interface SimulatorState extends SimulatorOptions {
  progress: number;
  isPlaying: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

type StateListener = (state: Readonly<SimulatorState>) => void;

export class AppState {
  private static instance: AppState;

  private state: SimulatorState = {
    progress: 0.0,
    isPlaying: true,
    speed: 0.45,
    cameraView: "side",
    showBarPath: true,
    showAngles: true,
    showVectors: true,
    showCoP: true,
    showGhosts: true,
    selectedMuscle: null,
    hoveredMuscle: null,
    barbellWeightKg: 100,
    athleteWeightKg: 85,
    movementId: "snatch",
    zoom: 1.0,
    panX: 0,
    panY: 0,
  };

  private listeners: Set<StateListener> = new Set();

  private constructor() {}

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  get(): Readonly<SimulatorState> {
    return this.state;
  }

  update(partial: Partial<SimulatorState>): void {
    let changed = false;
    for (const key of Object.keys(partial) as Array<keyof SimulatorState>) {
      if (this.state[key] !== partial[key]) {
        (this.state as unknown as Record<string, unknown>)[key] = partial[key];
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const readonlyState = Object.freeze({ ...this.state });
    for (const listener of this.listeners) {
      listener(readonlyState);
    }
  }

  resetCamera(): void {
    this.update({ zoom: 1.0, panX: 0, panY: 0 });
  }

  togglePlay(): void {
    this.update({ isPlaying: !this.state.isPlaying });
  }

  setProgress(p: number): void {
    const clamped = Math.max(0, Math.min(1, p));
    this.update({ progress: clamped });
  }

  setSpeed(speed: number): void {
    this.update({ speed });
  }

  setCameraView(cameraView: CameraView): void {
    this.update({ cameraView });
  }

  selectMuscle(muscleId: MuscleId | null): void {
    this.update({ selectedMuscle: muscleId });
  }

  hoverMuscle(muscleId: MuscleId | null): void {
    this.update({ hoveredMuscle: muscleId });
  }

  setBarbellWeight(kg: number): void {
    this.update({ barbellWeightKg: Math.max(20, Math.min(300, kg)) });
  }

  setMovement(movementId: MovementId): void {
    this.update({ movementId, progress: 0.0 });
  }
}
