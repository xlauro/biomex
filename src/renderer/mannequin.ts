import type { InterpolatedFrame, CameraView } from "../types/telemetry";
import type { ViewportTransform } from "./canvasManager";
import type { MuscleId } from "../types/muscles";
import type { Point2D } from "../types/kinematics";
import { MuscleRenderer } from "./muscleRenderer";
import { Vector2D } from "../core/vector2d";

export class MannequinRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    frame: InterpolatedFrame,
    cameraView: CameraView,
    selectedMuscle: MuscleId | null,
    hoveredMuscle: MuscleId | null
  ): void {
    if (cameraView === "side") {
      MannequinRenderer.drawSideView(ctx, vp, frame, selectedMuscle, hoveredMuscle);
    } else {
      MannequinRenderer.drawFrontView(ctx, vp, frame, selectedMuscle, hoveredMuscle);
    }
  }

  private static drawBoneSegment(
    ctx: CanvasRenderingContext2D,
    p1: Point2D,
    p2: Point2D,
    width: number
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.stroke();
    ctx.restore();
  }

  private static drawSideView(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    frame: InterpolatedFrame,
    selectedMuscle: MuscleId | null,
    hoveredMuscle: MuscleId | null
  ): void {
    const { originX, floorY, scale } = vp;
    const j: Record<string, Point2D> = {};

    for (const [key, pt] of Object.entries(frame.joints)) {
      j[key] = {
        x: originX + pt.x * scale,
        y: floorY - pt.y * scale,
      };
    }

    const emg = frame.emg;
    const ankle = j["ankle"]!;
    const knee = j["knee"]!;
    const hip = j["hip"]!;
    const shoulder = j["shoulder"]!;
    const elbow = j["elbow"]!;
    const wrist = j["wrist"]!;
    const head = j["head"]!;

    // 1. Sapatilha de LPO (Salto elevado de madeira, solado antiderrapante)
    ctx.save();
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ankle.x - scale * 0.07, floorY);
    ctx.lineTo(ankle.x + scale * 0.16, floorY);
    ctx.quadraticCurveTo(ankle.x + scale * 0.17, ankle.y, ankle.x + scale * 0.05, ankle.y);
    ctx.lineTo(ankle.x - scale * 0.06, ankle.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Salto rígido elevado
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(ankle.x - scale * 0.065, floorY - scale * 0.03, scale * 0.06, scale * 0.03);
    ctx.restore();

    // 2. Esqueleto Ósseo Interno
    MannequinRenderer.drawBoneSegment(ctx, ankle, knee, scale * 0.05);
    MannequinRenderer.drawBoneSegment(ctx, knee, hip, scale * 0.065);
    MannequinRenderer.drawBoneSegment(ctx, hip, shoulder, scale * 0.08);
    MannequinRenderer.drawBoneSegment(ctx, shoulder, elbow, scale * 0.045);
    MannequinRenderer.drawBoneSegment(ctx, elbow, wrist, scale * 0.04);

    // 3. Cabeça e Pescoço Biomecânico
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(head.x, head.y);
    ctx.lineWidth = scale * 0.055;
    ctx.strokeStyle = "#334155";
    ctx.lineCap = "round";
    ctx.stroke();

    // Crânio
    ctx.beginPath();
    ctx.arc(head.x, head.y - scale * 0.02, scale * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#64748b";
    ctx.stroke();

    // Visor ocular voltado para a frente
    ctx.beginPath();
    ctx.arc(head.x + scale * 0.055, head.y - scale * 0.025, scale * 0.018, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // 4. Músculos Anatômicos em Camadas
    // Panturrilha (Calves)
    MuscleRenderer.drawBelly(
      ctx,
      knee.x,
      knee.y,
      ankle.x,
      ankle.y,
      scale * 0.03,
      scale * 0.068,
      scale * 0.015,
      scale * 0.032,
      "calves",
      emg.calves,
      selectedMuscle,
      hoveredMuscle
    );

    // Isquiotibiais (Hamstrings)
    MuscleRenderer.drawBelly(
      ctx,
      hip.x,
      hip.y,
      knee.x,
      knee.y,
      scale * 0.045,
      scale * 0.078,
      scale * 0.03,
      scale * 0.038,
      "hamstrings",
      emg.hamstrings,
      selectedMuscle,
      hoveredMuscle
    );

    // Quadríceps (Quads)
    MuscleRenderer.drawBelly(
      ctx,
      hip.x,
      hip.y,
      knee.x,
      knee.y,
      scale * 0.05,
      scale * 0.098,
      scale * 0.038,
      -scale * 0.04,
      "quads",
      emg.quads,
      selectedMuscle,
      hoveredMuscle
    );

    // Glúteos (Glutes)
    const gluteEnd = {
      x: Vector2D.lerp(hip.x, knee.x, 0.32),
      y: Vector2D.lerp(hip.y, knee.y, 0.32),
    };
    MuscleRenderer.drawBelly(
      ctx,
      hip.x - scale * 0.02,
      hip.y - scale * 0.04,
      gluteEnd.x,
      gluteEnd.y,
      scale * 0.07,
      scale * 0.098,
      scale * 0.04,
      scale * 0.048,
      "glutes",
      emg.glutes,
      selectedMuscle,
      hoveredMuscle
    );

    // Core / Abdominal
    MuscleRenderer.drawBelly(
      ctx,
      shoulder.x,
      shoulder.y,
      hip.x,
      hip.y,
      scale * 0.06,
      scale * 0.084,
      scale * 0.065,
      -scale * 0.044,
      "core",
      emg.core,
      selectedMuscle,
      hoveredMuscle
    );

    // Eretores da Espinha / Lombar
    MuscleRenderer.drawBelly(
      ctx,
      shoulder.x,
      shoulder.y,
      hip.x,
      hip.y,
      scale * 0.045,
      scale * 0.075,
      scale * 0.06,
      scale * 0.042,
      "erectors",
      emg.erectors,
      selectedMuscle,
      hoveredMuscle
    );

    // Latíssimo do Dorso (Lats)
    const midTorso = {
      x: Vector2D.lerp(shoulder.x, hip.x, 0.72),
      y: Vector2D.lerp(shoulder.y, hip.y, 0.72),
    };
    MuscleRenderer.drawBelly(
      ctx,
      shoulder.x,
      shoulder.y,
      midTorso.x,
      midTorso.y,
      scale * 0.04,
      scale * 0.088,
      scale * 0.03,
      scale * 0.015,
      "lats",
      emg.lats,
      selectedMuscle,
      hoveredMuscle
    );

    // Trapézio (Traps)
    MuscleRenderer.drawBelly(
      ctx,
      head.x - scale * 0.02,
      head.y + scale * 0.02,
      shoulder.x - scale * 0.03,
      shoulder.y + scale * 0.04,
      scale * 0.03,
      scale * 0.07,
      scale * 0.05,
      scale * 0.015,
      "traps",
      emg.traps,
      selectedMuscle,
      hoveredMuscle
    );

    // Braço e Antebraço (Arms / Triceps)
    MuscleRenderer.drawBelly(
      ctx,
      shoulder.x,
      shoulder.y,
      elbow.x,
      elbow.y,
      scale * 0.045,
      scale * 0.065,
      scale * 0.035,
      0,
      "arms",
      emg.arms,
      selectedMuscle,
      hoveredMuscle
    );
    MuscleRenderer.drawBelly(
      ctx,
      elbow.x,
      elbow.y,
      wrist.x,
      wrist.y,
      scale * 0.038,
      scale * 0.05,
      scale * 0.025,
      0,
      "arms",
      emg.arms,
      selectedMuscle,
      hoveredMuscle
    );

    // Deltoide (Delts)
    const deltEnd = {
      x: Vector2D.lerp(shoulder.x, elbow.x, 0.38),
      y: Vector2D.lerp(shoulder.y, elbow.y, 0.38),
    };
    MuscleRenderer.drawBelly(
      ctx,
      shoulder.x,
      shoulder.y - scale * 0.02,
      deltEnd.x,
      deltEnd.y,
      scale * 0.075,
      scale * 0.085,
      scale * 0.03,
      0,
      "delts",
      emg.delts,
      selectedMuscle,
      hoveredMuscle
    );

    // 5. Marcadores de Articulações
    const jointsToDraw = [ankle, knee, hip, shoulder, elbow, wrist];
    for (const pt of jointsToDraw) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#38bdf8";
      ctx.stroke();
    }
  }

  private static drawFrontView(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    frame: InterpolatedFrame,
    selectedMuscle: MuscleId | null,
    hoveredMuscle: MuscleId | null
  ): void {
    const { originX, floorY, scale } = vp;
    const joints = frame.joints;

    const yAnkle = floorY - joints.ankle.y * scale;
    const yKnee = floorY - joints.knee.y * scale;
    const yHip = floorY - joints.hip.y * scale;
    const yShoulder = floorY - joints.shoulder.y * scale;
    const yElbow = floorY - joints.elbow.y * scale;
    const yWrist = floorY - joints.wrist.y * scale;
    const yHead = floorY - joints.head.y * scale;

    const emg = frame.emg;

    const kneeFlare = ((180 - frame.angles.knee) / 120) * 0.11;
    const footX = 0.16 * scale;
    const kneeX = (0.17 + kneeFlare) * scale;
    const hipX = 0.12 * scale;
    const shoulderX = 0.22 * scale;
    const elbowX = 0.36 * scale;
    const wristX = 0.52 * scale;

    // Cabeça
    ctx.save();
    ctx.beginPath();
    ctx.arc(originX, yHead - scale * 0.02, scale * 0.078, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#64748b";
    ctx.stroke();
    ctx.restore();

    // Eretores e Core central
    MuscleRenderer.drawBelly(
      ctx,
      originX,
      yShoulder,
      originX,
      yHip,
      scale * 0.16,
      scale * 0.19,
      scale * 0.15,
      0,
      "erectors",
      emg.erectors,
      selectedMuscle,
      hoveredMuscle
    );
    MuscleRenderer.drawBelly(
      ctx,
      originX,
      yShoulder + scale * 0.05,
      originX,
      yHip,
      scale * 0.11,
      scale * 0.14,
      scale * 0.1,
      0,
      "core",
      emg.core,
      selectedMuscle,
      hoveredMuscle
    );

    // Simetria Bilateral
    [-1, 1].forEach((side) => {
      const ax = originX + side * footX;
      const kx = originX + side * kneeX;
      const hx = originX + side * hipX;
      const sx = originX + side * shoulderX;
      const ex = originX + side * elbowX;
      const wx = originX + side * wristX;

      // Pés
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(ax - scale * 0.05, floorY - scale * 0.06, scale * 0.1, scale * 0.06, 4);
      ctx.fill();

      // Ossos
      MannequinRenderer.drawBoneSegment(ctx, { x: ax, y: yAnkle }, { x: kx, y: yKnee }, scale * 0.045);
      MannequinRenderer.drawBoneSegment(ctx, { x: kx, y: yKnee }, { x: hx, y: yHip }, scale * 0.055);
      MannequinRenderer.drawBoneSegment(ctx, { x: sx, y: yShoulder }, { x: ex, y: yElbow }, scale * 0.04);
      MannequinRenderer.drawBoneSegment(ctx, { x: ex, y: yElbow }, { x: wx, y: yWrist }, scale * 0.035);

      // Panturrilha
      MuscleRenderer.drawBelly(
        ctx,
        kx,
        yKnee,
        ax,
        yAnkle,
        scale * 0.045,
        scale * 0.075,
        scale * 0.025,
        0,
        "calves",
        emg.calves,
        selectedMuscle,
        hoveredMuscle
      );

      // Isquiotibiais / Adutores
      MuscleRenderer.drawBelly(
        ctx,
        hx - side * scale * 0.02,
        yHip,
        kx - side * scale * 0.02,
        yKnee,
        scale * 0.05,
        scale * 0.068,
        scale * 0.03,
        0,
        "hamstrings",
        emg.hamstrings,
        selectedMuscle,
        hoveredMuscle
      );

      // Quadríceps
      MuscleRenderer.drawBelly(
        ctx,
        hx,
        yHip,
        kx,
        yKnee,
        scale * 0.07,
        scale * 0.11,
        scale * 0.045,
        side * scale * 0.01,
        "quads",
        emg.quads,
        selectedMuscle,
        hoveredMuscle
      );

      // Glúteos laterais
      MuscleRenderer.drawBelly(
        ctx,
        hx,
        yHip - scale * 0.04,
        hx + side * scale * 0.03,
        yHip + scale * 0.08,
        scale * 0.06,
        scale * 0.078,
        scale * 0.04,
        0,
        "glutes",
        emg.glutes,
        selectedMuscle,
        hoveredMuscle
      );

      // Dorsais (Lats)
      MuscleRenderer.drawBelly(
        ctx,
        sx,
        yShoulder,
        hx,
        yHip - scale * 0.03,
        scale * 0.05,
        scale * 0.078,
        scale * 0.02,
        0,
        "lats",
        emg.lats,
        selectedMuscle,
        hoveredMuscle
      );

      // Trapézio
      MuscleRenderer.drawBelly(
        ctx,
        originX + side * scale * 0.03,
        yHead + scale * 0.04,
        sx,
        yShoulder,
        scale * 0.035,
        scale * 0.068,
        scale * 0.04,
        0,
        "traps",
        emg.traps,
        selectedMuscle,
        hoveredMuscle
      );

      // Braços
      MuscleRenderer.drawBelly(
        ctx,
        sx,
        yShoulder,
        ex,
        yElbow,
        scale * 0.045,
        scale * 0.062,
        scale * 0.035,
        0,
        "arms",
        emg.arms,
        selectedMuscle,
        hoveredMuscle
      );
      MuscleRenderer.drawBelly(
        ctx,
        ex,
        yElbow,
        wx,
        yWrist,
        scale * 0.038,
        scale * 0.05,
        scale * 0.025,
        0,
        "arms",
        emg.arms,
        selectedMuscle,
        hoveredMuscle
      );

      // Deltoides
      MuscleRenderer.drawBelly(
        ctx,
        sx,
        yShoulder - scale * 0.01,
        Vector2D.lerp(sx, ex, 0.4),
        Vector2D.lerp(yShoulder, yElbow, 0.4),
        scale * 0.075,
        scale * 0.088,
        scale * 0.03,
        0,
        "delts",
        emg.delts,
        selectedMuscle,
        hoveredMuscle
      );
    });
  }
}
