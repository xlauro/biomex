import type { ViewportTransform } from "./canvasManager";

export class EnvironmentRenderer {
  static draw(ctx: CanvasRenderingContext2D, vp: ViewportTransform): void {
    const { width, height, originX, floorY, scale } = vp;

    ctx.save();

    // Grade cinemática de fundo a cada 25cm reais
    const gridStep = scale * 0.25;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(51, 65, 85, 0.22)";

    // Linhas verticais
    const startX = originX % gridStep;
    for (let x = startX; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, floorY);
      ctx.stroke();
    }
    for (let x = startX - gridStep; x > 0; x -= gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, floorY);
      ctx.stroke();
    }

    // Linhas horizontais
    for (let y = floorY; y > 0; y -= gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Régua de altura métrica vertical na margem
    ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
    ctx.font = '10px "JetBrains Mono", monospace';
    for (let m = 0.5; m <= 2.5; m += 0.5) {
      const yPos = floorY - m * scale;
      if (yPos > 10 && yPos < height) {
        ctx.fillText(`${m.toFixed(1)}m`, 14, yPos - 4);
        ctx.beginPath();
        ctx.moveTo(10, yPos);
        ctx.lineTo(44, yPos);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.stroke();
      }
    }

    // Linha de Centro de Gravidade vertical do atleta
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(originX, floorY);
    ctx.lineTo(originX, floorY - scale * 2.25);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Plataforma Oficial de LPO (Madeira e Borracha com chanfro luminoso)
    const platW = scale * 2.2;
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, floorY, width, height - floorY);

    const platGrad = ctx.createLinearGradient(
      originX - platW / 2,
      floorY,
      originX + platW / 2,
      floorY
    );
    platGrad.addColorStop(0, "rgba(14, 165, 233, 0.05)");
    platGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.35)");
    platGrad.addColorStop(1, "rgba(14, 165, 233, 0.05)");
    ctx.fillStyle = platGrad;
    ctx.fillRect(originX - platW / 2, floorY, platW, 8);

    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
