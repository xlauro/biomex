import type { Movement } from "../types/movement";
import type { TrajectoryPoint } from "../engine/kinematicsEngine";
import type { ViewportTransform } from "./canvasManager";

export class TrajectoryRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    trajectory: TrajectoryPoint[],
    currentProgress: number,
    movement: Movement,
    showGhosts: boolean
  ): void {
    const { originX, floorY, scale } = vp;

    if (trajectory.length === 0) return;

    ctx.save();

    // 1. Fantasmas Estroboscópicos nos Keyframes
    if (showGhosts) {
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.fillStyle = "rgba(148, 163, 184, 0.08)";

      for (const kf of movement.keyframes) {
        // Posições dos ossos do keyframe
        const pts = {
          ankle: { x: originX + kf.joints.ankle.x * scale, y: floorY - kf.joints.ankle.y * scale },
          knee: { x: originX + kf.joints.knee.x * scale, y: floorY - kf.joints.knee.y * scale },
          hip: { x: originX + kf.joints.hip.x * scale, y: floorY - kf.joints.hip.y * scale },
          shoulder: { x: originX + kf.joints.shoulder.x * scale, y: floorY - kf.joints.shoulder.y * scale },
          elbow: { x: originX + kf.joints.elbow.x * scale, y: floorY - kf.joints.elbow.y * scale },
          wrist: { x: originX + kf.joints.wrist.x * scale, y: floorY - kf.joints.wrist.y * scale },
          head: { x: originX + kf.joints.head.x * scale, y: floorY - kf.joints.head.y * scale },
        };

        // Linhas esqueléticas do fantasma
        ctx.beginPath();
        ctx.moveTo(pts.ankle.x, pts.ankle.y);
        ctx.lineTo(pts.knee.x, pts.knee.y);
        ctx.lineTo(pts.hip.x, pts.hip.y);
        ctx.lineTo(pts.shoulder.x, pts.shoulder.y);
        ctx.lineTo(pts.elbow.x, pts.elbow.y);
        ctx.lineTo(pts.wrist.x, pts.wrist.y);
        ctx.stroke();

        // Cabeça fantasma
        ctx.beginPath();
        ctx.arc(pts.head.x, pts.head.y, scale * 0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Marcador da barra no keyframe
        ctx.beginPath();
        ctx.arc(pts.wrist.x, pts.wrist.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Trajetória completa tracejada sutil
    ctx.beginPath();
    for (let i = 0; i < trajectory.length; i++) {
      const pt = trajectory[i]!;
      const bx = originX + pt.x * scale;
      const by = floorY - pt.y * scale;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Trajetória ativa brilhante até o instante atual
    ctx.setLineDash([]);
    ctx.beginPath();
    const clampedP = Math.max(0, Math.min(1, currentProgress));
    const maxIdx = Math.min(
      trajectory.length - 1,
      Math.floor(clampedP * (trajectory.length - 1))
    );
    for (let i = 0; i <= maxIdx; i++) {
      const pt = trajectory[i];
      if (!pt) continue;
      const bx = originX + pt.x * scale;
      const by = floorY - pt.y * scale;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.strokeStyle = "#10b981";
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.restore();
  }
}
