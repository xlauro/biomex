import type { MuscleId } from "../types/muscles";
import { getThermalColor } from "../data/muscles";

export class MuscleRenderer {
  /**
   * Desenha um feixe muscular orgânico fusiforme com estrias anatômicas e mapa de calor
   */
  static drawBelly(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thicknessStart: number,
    thicknessMid: number,
    thicknessEnd: number,
    offsetPerp: number,
    muscleId: MuscleId,
    emgVal: number,
    selectedMuscleId: MuscleId | null,
    hoveredMuscleId: MuscleId | null
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    const angle = Math.atan2(dy, dx);
    const activeFilter = selectedMuscleId || hoveredMuscleId;
    const isHighlighted = activeFilter === muscleId;
    const isDimmed = activeFilter !== null && activeFilter !== muscleId;

    const alpha = isDimmed ? 0.22 : 0.95;
    const baseColor = getThermalColor(emgVal, alpha);
    const coreColor = getThermalColor(Math.min(100, emgVal + 14), alpha);

    // Efeito de pulso de contração em alta ativação (EMG > 85%)
    let dynamicThickness = thicknessMid;
    if (emgVal > 85) {
      const pulse = Math.sin(performance.now() * 0.008) * 0.08 + 1.0;
      dynamicThickness *= pulse;
    }

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    // Brilho / Glow térmico proporcional à ativação
    if (!isDimmed && (emgVal > 70 || isHighlighted)) {
      ctx.shadowColor = isHighlighted ? "#38bdf8" : getThermalColor(emgVal, 0.85);
      ctx.shadowBlur = isHighlighted ? 24 : (emgVal - 60) * 0.55;
    }

    const midX = len * 0.5;
    const yTopStart = offsetPerp - thicknessStart * 0.5;
    const yBotStart = offsetPerp + thicknessStart * 0.5;
    const yTopMid = offsetPerp - dynamicThickness;
    const yBotMid = offsetPerp + dynamicThickness;

    ctx.beginPath();
    ctx.moveTo(0, offsetPerp);
    ctx.bezierCurveTo(len * 0.18, yTopStart, midX, yTopMid, len, offsetPerp);
    ctx.bezierCurveTo(midX, yBotMid, len * 0.18, yBotStart, 0, offsetPerp);
    ctx.closePath();

    // Gradiente térmico volumétrico
    const grad = ctx.createLinearGradient(0, yTopMid, 0, yBotMid);
    grad.addColorStop(0, baseColor);
    grad.addColorStop(0.5, coreColor);
    grad.addColorStop(1, baseColor);
    ctx.fillStyle = grad;
    ctx.fill();

    // Contorno de definição anatômica
    ctx.lineWidth = isHighlighted ? 2.4 : 1.1;
    ctx.strokeStyle = isHighlighted
      ? "#ffffff"
      : isDimmed
      ? "rgba(148, 163, 184, 0.1)"
      : "rgba(255, 255, 255, 0.3)";
    ctx.stroke();

    // Estrias de fibras musculares internas
    if (!isDimmed && dynamicThickness > 5) {
      ctx.beginPath();
      ctx.moveTo(len * 0.12, offsetPerp);
      ctx.quadraticCurveTo(midX, offsetPerp - dynamicThickness * 0.28, len * 0.88, offsetPerp);
      ctx.moveTo(len * 0.12, offsetPerp);
      ctx.quadraticCurveTo(midX, offsetPerp + dynamicThickness * 0.28, len * 0.88, offsetPerp);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.stroke();
    }

    ctx.restore();
  }
}
