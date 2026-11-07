import type { InterpolatedFrame } from "../types/telemetry";
import type { ViewportTransform } from "./canvasManager";

export class OverlayRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    frame: InterpolatedFrame,
    showAngles: boolean,
    showVectors: boolean,
    showCoP: boolean
  ): void {
    const { originX, floorY, scale } = vp;
    const j = {
      ankle: { x: originX + frame.joints.ankle.x * scale, y: floorY - frame.joints.ankle.y * scale },
      knee: { x: originX + frame.joints.knee.x * scale, y: floorY - frame.joints.knee.y * scale },
      hip: { x: originX + frame.joints.hip.x * scale, y: floorY - frame.joints.hip.y * scale },
      shoulder: { x: originX + frame.joints.shoulder.x * scale, y: floorY - frame.joints.shoulder.y * scale },
      elbow: { x: originX + frame.joints.elbow.x * scale, y: floorY - frame.joints.elbow.y * scale },
    };

    // 1. Arcos e Rótulos de Ângulos Articulares
    if (showAngles) {
      ctx.save();
      ctx.font = 'bold 11px "JetBrains Mono", monospace';

      // Joelho
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(j.knee.x, j.knee.y, 20, 0, Math.PI * 1.3);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillText(`${frame.angles.knee}°`, j.knee.x + 24, j.knee.y + 4);

      // Quadril
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(j.hip.x, j.hip.y, 20, -Math.PI * 0.4, Math.PI * 0.5);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.stroke();
      ctx.fillText(`${frame.angles.hip}°`, j.hip.x - 48, j.hip.y + 4);

      // Inclinação do Tronco
      ctx.fillStyle = "#a855f7";
      ctx.fillText(`Tronco: ${frame.angles.trunk}°`, j.shoulder.x + 16, j.shoulder.y - 12);

      // Cotovelo
      ctx.fillStyle = "#34d399";
      ctx.fillText(`${frame.angles.elbow}°`, j.elbow.x + 14, j.elbow.y + 14);

      ctx.restore();
    }

    // 2. Vetor de Força de Reação do Solo (FRS)
    if (showVectors) {
      ctx.save();
      const x = originX + frame.copX * scale;
      const yStart = floorY;
      const grfRatio = frame.groundReactionForceRatio;
      const arrowHeight = scale * Math.max(0.3, Math.min(1.4, grfRatio * 0.45));
      const yEnd = floorY - arrowHeight;

      const grad = ctx.createLinearGradient(x, yStart, x, yEnd);
      grad.addColorStop(0, "rgba(245, 158, 11, 0.15)");
      grad.addColorStop(1, "rgba(245, 158, 11, 0.95)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x, yEnd);
      ctx.stroke();

      // Seta
      ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(x, yEnd - 8);
      ctx.lineTo(x - 6, yEnd + 4);
      ctx.lineTo(x + 6, yEnd + 4);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`FRS ${grfRatio.toFixed(1)}x PC`, x + 10, yEnd + 4);
      ctx.restore();
    }

    // 3. Medidor de Centro de Pressão Plantar (CoP)
    if (showCoP) {
      ctx.save();
      const footBaseX = originX;
      const copPixelX = originX + frame.copX * scale;
      const copY = floorY + 4;

      // Base do pé delimitada no solo
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(footBaseX - scale * 0.08, copY);
      ctx.lineTo(footBaseX + scale * 0.16, copY);
      ctx.stroke();

      // Ponto de pressão dinâmico (CoP)
      ctx.beginPath();
      ctx.arc(copPixelX, copY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.fill();

      // Rótulo descritivo do ponto de pressão
      let zoneLabel = "Meio do pé";
      if (frame.copX > 0.04) zoneLabel = "Antepé (Ponta)";
      else if (frame.copX < -0.01) zoneLabel = "Calcanhar";

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`CoP: ${zoneLabel}`, footBaseX - scale * 0.08, copY + 14);

      ctx.restore();
    }
  }
}
