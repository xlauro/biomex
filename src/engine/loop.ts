import { AppState } from "./state";

export type RenderCallback = (dt: number) => void;

export class SimulationLoop {
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;
  private callbacks: Set<RenderCallback> = new Set();
  private state = AppState.getInstance();

  constructor() {
    this.tick = this.tick.bind(this);
  }

  onRender(callback: RenderCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    const current = this.state.get();

    if (current.isPlaying) {
      // Ciclo completo em 1x velocidade padrão
      const progressDelta = dt * 0.45 * current.speed;
      let nextProgress = current.progress + progressDelta;

      if (nextProgress > 1.05) {
        nextProgress = 0.0;
      }

      this.state.update({ progress: nextProgress });
    }

    // Disparar renderizadores
    for (const callback of this.callbacks) {
      callback(dt);
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  }
}
