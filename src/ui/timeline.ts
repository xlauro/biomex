import { AppState } from "../engine/state";
import type { Movement } from "../types/movement";

export class TimelineUI {
  private state = AppState.getInstance();
  private slider: HTMLInputElement | null;
  private progressLabel: HTMLElement | null;
  private btnPlayPause: HTMLElement | null;
  private iconPlay: HTMLElement | null;
  private iconPause: HTMLElement | null;
  private txtPlayPause: HTMLElement | null;
  private phaseContainer: HTMLElement | null;
  private currentMovement: Movement | null = null;

  constructor() {
    this.slider = document.getElementById("timelineSlider") as HTMLInputElement | null;
    this.progressLabel = document.getElementById("progressLabel");
    this.btnPlayPause = document.getElementById("btnPlayPause");
    this.iconPlay = document.getElementById("iconPlay");
    this.iconPause = document.getElementById("iconPause");
    this.txtPlayPause = document.getElementById("txtPlayPause");
    this.phaseContainer = document.getElementById("phaseButtonsContainer");

    this.setupListeners();
  }

  private setupListeners(): void {
    if (this.slider) {
      this.slider.addEventListener("input", (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value) / 1000;
        this.state.update({ isPlaying: false, progress: val });
      });
    }

    if (this.btnPlayPause) {
      this.btnPlayPause.addEventListener("click", () => {
        this.state.togglePlay();
      });
    }

    // Step frame buttons
    const btnStepBack = document.getElementById("btnStepBack");
    const btnStepForward = document.getElementById("btnStepForward");

    btnStepBack?.addEventListener("click", () => {
      const currentP = this.state.get().progress;
      this.state.update({ isPlaying: false, progress: (currentP - 0.02 + 1.0) % 1.0 });
    });

    btnStepForward?.addEventListener("click", () => {
      const currentP = this.state.get().progress;
      this.state.update({ isPlaying: false, progress: (currentP + 0.02) % 1.0 });
    });

    // Speed selector buttons
    [0.2, 0.45, 1.0].forEach((spd) => {
      const btn = document.getElementById(`spd-${spd}`);
      btn?.addEventListener("click", () => {
        this.state.setSpeed(spd);
        this.updateSpeedButtons(spd);
      });
    });
  }

  updateMovement(movement: Movement): void {
    this.currentMovement = movement;
    const container = this.phaseContainer;
    if (!container) return;

    container.innerHTML = "";
    movement.phases.forEach((phase) => {
      const btn = document.createElement("button");
      btn.id = `phaseBtn-${phase.index}`;
      btn.className =
        "phase-btn px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-800 bg-slate-900/70 text-slate-300 hover:text-white truncate transition-all";
      btn.textContent = `${phase.index + 1}. ${phase.shortName}`;
      btn.addEventListener("click", () => {
        this.state.update({ isPlaying: false, progress: phase.progress });
      });
      container.appendChild(btn);
    });
  }

  update(progress: number, timeSec: number, activePhaseIndex: number, isPlaying: boolean): void {
    if (this.slider) {
      this.slider.value = Math.round(progress * 1000).toString();
    }

    if (this.progressLabel) {
      this.progressLabel.textContent = `${Math.round(progress * 100)}% (${timeSec.toFixed(2)}s)`;
    }

    if (this.txtPlayPause) {
      this.txtPlayPause.textContent = isPlaying ? "Pausar" : "Reproduzir";
    }
    if (this.iconPlay && this.iconPause) {
      if (isPlaying) {
        this.iconPlay.classList.add("hidden");
        this.iconPause.classList.remove("hidden");
      } else {
        this.iconPlay.classList.remove("hidden");
        this.iconPause.classList.add("hidden");
      }
    }

    // Atualiza botão de fase ativa
    if (this.currentMovement) {
      for (let i = 0; i < this.currentMovement.phases.length; i++) {
        const btn = document.getElementById(`phaseBtn-${i}`);
        if (btn) {
          if (i === activePhaseIndex) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        }
      }
    }
  }

  private updateSpeedButtons(activeSpd: number): void {
    [0.2, 0.45, 1.0].forEach((spd) => {
      const btn = document.getElementById(`spd-${spd}`);
      if (btn) {
        if (spd === activeSpd) {
          btn.className =
            "speed-btn px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-800 text-sky-400 font-bold border border-sky-500/30";
        } else {
          btn.className =
            "speed-btn px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white";
        }
      }
    });
  }
}
