import type { InterpolatedFrame } from "../types/telemetry";
import type { MuscleId } from "../types/muscles";
import { MUSCLE_GROUPS, getThermalColor, getMuscleById } from "../data/muscles";
import { AppState } from "../engine/state";

export class MuscleListUI {
  private container: HTMLElement | null;
  private callout: HTMLElement | null;
  private calloutMuscleName: HTMLElement | null;
  private calloutMuscleVal: HTMLElement | null;
  private calloutMuscleRole: HTMLElement | null;
  private btnClearFilter: HTMLElement | null;
  private phaseDetailTitle: HTMLElement | null;
  private phaseActionType: HTMLElement | null;
  private phaseDetailDesc: HTMLElement | null;
  private state = AppState.getInstance();

  constructor() {
    this.container = document.getElementById("muscleDashboardList");
    this.callout = document.getElementById("muscleCallout");
    this.calloutMuscleName = document.getElementById("calloutMuscleName");
    this.calloutMuscleVal = document.getElementById("calloutMuscleVal");
    this.calloutMuscleRole = document.getElementById("calloutMuscleRole");
    this.btnClearFilter = document.getElementById("btnClearHighlight");
    this.phaseDetailTitle = document.getElementById("phaseDetailTitle");
    this.phaseActionType = document.getElementById("phaseActionType");
    this.phaseDetailDesc = document.getElementById("phaseDetailDesc");

    this.initDOM();
    this.setupListeners();
  }

  private initDOM(): void {
    if (!this.container) return;
    this.container.innerHTML = "";

    MUSCLE_GROUPS.forEach((m) => {
      const row = document.createElement("div");
      row.id = `muscle-row-${m.id}`;
      row.className =
        "muscle-row cursor-pointer rounded-xl p-2.5 bg-slate-900/65 border border-slate-800/80 flex flex-col gap-1.5 transition-all";

      row.addEventListener("mouseenter", () => {
        this.state.hoverMuscle(m.id);
      });

      row.addEventListener("mouseleave", () => {
        this.state.hoverMuscle(null);
      });

      row.addEventListener("click", () => {
        const currentSelected = this.state.get().selectedMuscle;
        this.state.selectMuscle(currentSelected === m.id ? null : m.id);
      });

      row.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span id="dot-${m.id}" class="w-2.5 h-2.5 rounded-full shadow-sm"></span>
            <div>
              <div class="text-xs font-bold text-slate-100 leading-none">${m.name}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">${m.subtitle}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span id="badge-${m.id}" class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Moderado</span>
            <span id="val-${m.id}" class="mono text-xs font-extrabold text-white w-9 text-right">0%</span>
          </div>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800/70">
          <div id="bar-${m.id}" class="h-full rounded-full transition-all duration-75" style="width: 0%"></div>
        </div>
      `;

      this.container?.appendChild(row);
    });
  }

  private setupListeners(): void {
    this.btnClearFilter?.addEventListener("click", () => {
      this.state.selectMuscle(null);
    });
  }

  update(frame: InterpolatedFrame): void {
    const currentState = this.state.get();

    // Atualiza Card de Análise Cinesiológica da Fase
    if (this.phaseDetailTitle) this.phaseDetailTitle.textContent = frame.phaseTitle;
    if (this.phaseActionType) this.phaseActionType.textContent = frame.actionType;
    if (this.phaseDetailDesc) this.phaseDetailDesc.textContent = frame.phaseDesc;

    // Atualiza botão de limpar filtro
    if (this.btnClearFilter) {
      if (currentState.selectedMuscle) {
        this.btnClearFilter.classList.remove("hidden");
      } else {
        this.btnClearFilter.classList.add("hidden");
      }
    }

    // Atualiza barras de ativação EMG
    MUSCLE_GROUPS.forEach((m) => {
      const val = frame.emg[m.id] ?? 0;
      const color = getThermalColor(val, 1);

      const barEl = document.getElementById(`bar-${m.id}`);
      const valEl = document.getElementById(`val-${m.id}`);
      const dotEl = document.getElementById(`dot-${m.id}`);
      const badgeEl = document.getElementById(`badge-${m.id}`);
      const rowEl = document.getElementById(`muscle-row-${m.id}`);

      if (barEl) {
        barEl.style.width = `${val}%`;
        barEl.style.backgroundColor = color;
        barEl.style.boxShadow = val > 80 ? `0 0 10px ${color}` : "none";
      }
      if (valEl) {
        valEl.textContent = `${val}%`;
        valEl.style.color = val > 85 ? "#fda4af" : "#f8fafc";
      }
      if (dotEl) {
        dotEl.style.backgroundColor = color;
        dotEl.style.boxShadow = `0 0 8px ${color}`;
      }
      if (badgeEl) {
        let label = "Baixa";
        if (val >= 90) label = "PICO MÁX";
        else if (val >= 75) label = "Alta";
        else if (val >= 50) label = "Moderada";
        badgeEl.textContent = label;
        badgeEl.style.color = color;
      }
      if (rowEl) {
        if (currentState.selectedMuscle === m.id) {
          rowEl.classList.add("active");
          rowEl.style.borderColor = "rgba(56, 189, 248, 0.8)";
        } else {
          rowEl.classList.remove("active");
          rowEl.style.borderColor = "";
        }
      }
    });

    // Atualiza o Callout Flutuante
    const activeMuscleId = currentState.hoveredMuscle || currentState.selectedMuscle;
    this.updateCallout(activeMuscleId, frame);
  }

  private updateCallout(muscleId: MuscleId | null, frame: InterpolatedFrame): void {
    if (!this.callout) return;

    if (!muscleId) {
      this.callout.classList.add("hidden");
      return;
    }

    const muscle = getMuscleById(muscleId);
    if (!muscle) return;

    const val = frame.emg[muscleId] ?? 0;
    const color = getThermalColor(val, 1);

    this.callout.classList.remove("hidden");
    if (this.calloutMuscleName) this.calloutMuscleName.textContent = muscle.name;
    if (this.calloutMuscleVal) {
      this.calloutMuscleVal.textContent = `${val}% EMG`;
      this.calloutMuscleVal.style.color = color;
    }
    if (this.calloutMuscleRole) {
      this.calloutMuscleRole.textContent = muscle.roleByPhase[frame.phaseIndex] ?? "";
    }
  }
}
