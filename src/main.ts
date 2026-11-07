import "./style.css";
import { AppState } from "./engine/state";
import { SimulationLoop } from "./engine/loop";
import { MovementRegistry } from "./data/movements/registry";
import { KinematicsEngine, type TrajectoryPoint } from "./engine/kinematicsEngine";
import { CanvasManager } from "./renderer/canvasManager";
import { EnvironmentRenderer } from "./renderer/environment";
import { MannequinRenderer } from "./renderer/mannequin";
import { BarbellRenderer } from "./renderer/barbellRenderer";
import { TrajectoryRenderer } from "./renderer/trajectoryRenderer";
import { OverlayRenderer } from "./renderer/overlayRenderer";
import { HudUI } from "./ui/hud";
import { TimelineUI } from "./ui/timeline";
import { KinematicChartsUI } from "./ui/charts";
import { MuscleListUI } from "./ui/muscleList";
import { ControlsUI } from "./ui/controls";
import { ExportUI } from "./ui/exportModal";
import type { ChartSample } from "./types/telemetry";

function bootstrap(): void {
  const canvasEl = document.getElementById("biomechCanvas") as HTMLCanvasElement | null;
  const chartCanvasEl = document.getElementById("telemetryChartCanvas") as HTMLCanvasElement | null;

  if (!canvasEl || !chartCanvasEl) {
    console.error("Canvas elements not found");
    return;
  }

  const state = AppState.getInstance();
  const canvasManager = new CanvasManager(canvasEl);
  const loop = new SimulationLoop();

  // Inicializa Módulos de Interface
  const hudUI = new HudUI();
  const timelineUI = new TimelineUI();
  const chartsUI = new KinematicChartsUI(chartCanvasEl);
  const muscleListUI = new MuscleListUI();
  new ControlsUI();
  new ExportUI(canvasEl);

  let activeMovement = MovementRegistry.get(state.get().movementId);
  let precomputedTrajectory: TrajectoryPoint[] = [];
  let precomputedChartData: ChartSample[] = [];

  function recomputeTrajectory(): void {
    const s = state.get();
    activeMovement = MovementRegistry.get(s.movementId);
    const result = KinematicsEngine.precomputeTrajectory(
      activeMovement,
      s.barbellWeightKg,
      s.athleteWeightKg
    );
    precomputedTrajectory = result.trajectory;
    precomputedChartData = result.chartData;
    chartsUI.setChartData(precomputedChartData);
    timelineUI.updateMovement(activeMovement);
  }

  recomputeTrajectory();

  // Observa mudanças de movimento ou carga para recalcular física
  let lastMovementId = state.get().movementId;
  let lastWeight = state.get().barbellWeightKg;

  state.subscribe((currentState) => {
    if (currentState.movementId !== lastMovementId || currentState.barbellWeightKg !== lastWeight) {
      lastMovementId = currentState.movementId;
      lastWeight = currentState.barbellWeightKg;
      recomputeTrajectory();
    }
  });

  // Loop de Renderização Principal
  loop.onRender(() => {
    const s = state.get();
    const clampedProgress = Math.max(0, Math.min(1, s.progress));
    const frame = KinematicsEngine.getInterpolatedFrame(
      activeMovement,
      clampedProgress,
      s.barbellWeightKg,
      s.athleteWeightKg
    );

    // 1. Renderiza o Canvas 2D Biomecânico
    const vp = canvasManager.beginFrame();
    const ctx = canvasManager.getContext();

    // Ambiente (Grade e Plataforma)
    EnvironmentRenderer.draw(ctx, vp);

    // Fantasmas nos keyframes e Trajetória S-Curve
    if (s.showBarPath || s.showGhosts) {
      TrajectoryRenderer.draw(
        ctx,
        vp,
        precomputedTrajectory,
        clampedProgress,
        activeMovement,
        s.showGhosts
      );
    }

    // Manequim Anatômico e Músculos
    MannequinRenderer.draw(
      ctx,
      vp,
      frame,
      s.cameraView,
      s.selectedMuscle,
      s.hoveredMuscle
    );

    // Barra Olímpica e Anilhas IWF
    BarbellRenderer.draw(ctx, vp, frame, s.cameraView, s.barbellWeightKg);

    // Overlays (Ângulos, FRS, Centro de Pressão)
    OverlayRenderer.draw(ctx, vp, frame, s.showAngles, s.showVectors, s.showCoP);

    canvasManager.endFrame();

    // 2. Atualiza UI e Gráficos
    hudUI.update(frame);
    timelineUI.update(clampedProgress, frame.timeSec, frame.phaseIndex, s.isPlaying);
    chartsUI.render(clampedProgress);
    muscleListUI.update(frame);
  });

  loop.start();
}

// Inicia após o carregamento do DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
