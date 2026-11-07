import { AppState } from "../engine/state";
import { MovementRegistry } from "../data/movements/registry";
import type { MovementId } from "../types/movement";

export class ControlsUI {
  private state = AppState.getInstance();

  constructor() {
    this.setupMovementSelector();
    this.setupCameraViewButtons();
    this.setupOverlayToggles();
    this.setupBarbellWeightControls();
    this.setupResetCameraButton();
  }

  private setupMovementSelector(): void {
    const select = document.getElementById("selectMovement") as HTMLSelectElement | null;
    if (!select) return;

    select.innerHTML = "";
    const movements = MovementRegistry.getAll();
    movements.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });

    select.value = this.state.get().movementId;
    select.addEventListener("change", (e) => {
      const targetId = (e.target as HTMLSelectElement).value as MovementId;
      this.state.setMovement(targetId);
    });
  }

  private setupCameraViewButtons(): void {
    const btnSide = document.getElementById("btnViewSide");
    const btnFront = document.getElementById("btnViewFront");

    btnSide?.addEventListener("click", () => {
      this.state.setCameraView("side");
      this.updateCameraButtons("side");
    });

    btnFront?.addEventListener("click", () => {
      this.state.setCameraView("front");
      this.updateCameraButtons("front");
    });
  }

  private updateCameraButtons(view: "side" | "front"): void {
    const btnSide = document.getElementById("btnViewSide");
    const btnFront = document.getElementById("btnViewFront");

    if (view === "side") {
      btnSide?.classList.add("bg-sky-500", "text-white");
      btnSide?.classList.remove("text-slate-400");
      btnFront?.classList.remove("bg-sky-500", "text-white");
      btnFront?.classList.add("text-slate-400");
    } else {
      btnFront?.classList.add("bg-sky-500", "text-white");
      btnFront?.classList.remove("text-slate-400");
      btnSide?.classList.remove("bg-sky-500", "text-white");
      btnSide?.classList.add("text-slate-400");
    }
  }

  private setupOverlayToggles(): void {
    const toggles = [
      { id: "btnTogglePath", key: "showBarPath" as const },
      { id: "btnToggleAngles", key: "showAngles" as const },
      { id: "btnToggleVectors", key: "showVectors" as const },
      { id: "btnToggleCoP", key: "showCoP" as const },
      { id: "btnToggleGhosts", key: "showGhosts" as const },
    ];

    toggles.forEach(({ id, key }) => {
      const btn = document.getElementById(id);
      btn?.addEventListener("click", () => {
        const currentVal = this.state.get()[key];
        this.state.update({ [key]: !currentVal });
        if (btn) {
          btn.style.opacity = !currentVal ? "1" : "0.45";
        }
      });
    });
  }

  private setupBarbellWeightControls(): void {
    const slider = document.getElementById("sliderBarbellWeight") as HTMLInputElement | null;
    const label = document.getElementById("labelBarbellWeight");

    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        this.state.setBarbellWeight(val);
        if (label) label.textContent = `${val} kg`;
      });
    }

    // Presets
    [60, 100, 140, 180].forEach((w) => {
      const btn = document.getElementById(`weight-preset-${w}`);
      btn?.addEventListener("click", () => {
        this.state.setBarbellWeight(w);
        if (slider) slider.value = w.toString();
        if (label) label.textContent = `${w} kg`;
      });
    });
  }

  private setupResetCameraButton(): void {
    const btnReset = document.getElementById("btnResetCamera");
    btnReset?.addEventListener("click", () => {
      this.state.resetCamera();
    });
  }
}
