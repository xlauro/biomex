import type { InterpolatedFrame } from "../types/telemetry";

export class HudUI {
  private elPhaseTitle: HTMLElement | null;
  private elKneeAngle: HTMLElement | null;
  private elHipAngle: HTMLElement | null;
  private elBarHeight: HTMLElement | null;
  private elBarVel: HTMLElement | null;
  private elPower: HTMLElement | null;
  private elGRF: HTMLElement | null;

  constructor() {
    this.elPhaseTitle = document.getElementById("hudPhaseTitle");
    this.elKneeAngle = document.getElementById("hudKneeAngle");
    this.elHipAngle = document.getElementById("hudHipAngle");
    this.elBarHeight = document.getElementById("hudBarHeight");
    this.elBarVel = document.getElementById("hudBarVel");
    this.elPower = document.getElementById("hudPower");
    this.elGRF = document.getElementById("hudGRF");
  }

  update(frame: InterpolatedFrame): void {
    if (this.elPhaseTitle) this.elPhaseTitle.textContent = frame.phaseTitle;
    if (this.elKneeAngle) this.elKneeAngle.textContent = `${frame.angles.knee}°`;
    if (this.elHipAngle) this.elHipAngle.textContent = `${frame.angles.hip}°`;
    if (this.elBarHeight) this.elBarHeight.textContent = `${frame.dynamics.heightM.toFixed(2)}m`;
    if (this.elBarVel) {
      const v = frame.dynamics.velocity;
      this.elBarVel.textContent = `${v >= 0 ? "+" : ""}${v.toFixed(2)} m/s`;
    }
    if (this.elPower) {
      this.elPower.textContent = `${Math.round(frame.dynamics.powerWatts)} W`;
    }
    if (this.elGRF) {
      this.elGRF.textContent = `${frame.groundReactionForceRatio.toFixed(1)}x`;
    }
  }
}
