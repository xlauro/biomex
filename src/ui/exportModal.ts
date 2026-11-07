import { AppState } from "../engine/state";
import { MovementRegistry } from "../data/movements/registry";
import { KinematicsEngine } from "../engine/kinematicsEngine";

export class ExportUI {
  private canvas: HTMLCanvasElement;
  private state = AppState.getInstance();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    const btnSnapshot = document.getElementById("btnExportSnapshot");
    const btnCSV = document.getElementById("btnExportCSV");

    btnSnapshot?.addEventListener("click", () => this.exportSnapshot());
    btnCSV?.addEventListener("click", () => this.exportCSV());
  }

  private exportSnapshot(): void {
    const current = this.state.get();
    const movement = MovementRegistry.get(current.movementId);
    const dataUrl = this.canvas.toDataURL("image/png");

    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.download = `kinelab_${movement.id}_${Math.round(current.progress * 100)}pct_${timestamp}.png`;
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private exportCSV(): void {
    const current = this.state.get();
    const movement = MovementRegistry.get(current.movementId);

    const headers = [
      "Progress(%)",
      "Time(s)",
      "BarHeight(m)",
      "BarVelocity(m/s)",
      "BarAcceleration(m/s2)",
      "BarForce(N)",
      "BarPower(W)",
      "KneeAngle(deg)",
      "HipAngle(deg)",
      "TrunkAngle(deg)",
      "ElbowAngle(deg)",
      "GRF_Ratio(xBW)",
      "Quads_EMG(%)",
      "Glutes_EMG(%)",
      "Hamstrings_EMG(%)",
      "Erectors_EMG(%)",
      "Traps_EMG(%)",
    ];

    const rows: string[] = [headers.join(",")];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const f = KinematicsEngine.getInterpolatedFrame(
        movement,
        p,
        current.barbellWeightKg,
        current.athleteWeightKg
      );

      const row = [
        Math.round(p * 100),
        f.timeSec.toFixed(3),
        f.dynamics.heightM.toFixed(3),
        f.dynamics.velocity.toFixed(3),
        f.dynamics.acceleration.toFixed(3),
        Math.round(f.dynamics.forceN),
        Math.round(f.dynamics.powerWatts),
        f.angles.knee,
        f.angles.hip,
        f.angles.trunk,
        f.angles.elbow,
        f.groundReactionForceRatio.toFixed(2),
        f.emg.quads,
        f.emg.glutes,
        f.emg.hamstrings,
        f.emg.erectors,
        f.emg.traps,
      ];

      rows.push(row.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    const a = document.createElement("a");
    a.download = `kinelab_${movement.id}_telemetry.csv`;
    a.href = csvContent;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
