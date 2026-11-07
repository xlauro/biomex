import type { InterpolatedFrame, CameraView } from "../types/telemetry";
import type { ViewportTransform } from "./canvasManager";
import { PhysicsEngine } from "../core/physics";

export class BarbellRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    vp: ViewportTransform,
    frame: InterpolatedFrame,
    cameraView: CameraView,
    barbellWeightKg: number
  ): void {
    const { originX, floorY, scale } = vp;
    const barPt = {
      x: originX + frame.joints.wrist.x * scale,
      y: floorY - frame.joints.wrist.y * scale,
    };

    const plates = PhysicsEngine.getPlatesPerSleeve(barbellWeightKg);

    if (cameraView === "side") {
      BarbellRenderer.drawSideView(ctx, scale, barPt, plates);
    } else {
      BarbellRenderer.drawFrontView(ctx, originX, floorY, scale, frame, plates);
    }
  }

  private static drawSideView(
    ctx: CanvasRenderingContext2D,
    scale: number,
    barPt: { x: number; y: number },
    plates: ReturnType<typeof PhysicsEngine.getPlatesPerSleeve>
  ): void {
    const maxPlate = plates[0] ?? {
      color: "#ef4444",
      diameterRatio: 1.0,
    };
    const plateRadius = scale * 0.225 * maxPlate.diameterRatio;

    ctx.save();

    // Anilha translúcida com anel externo e gradiente
    const plateGrad = ctx.createRadialGradient(
      barPt.x,
      barPt.y,
      scale * 0.03,
      barPt.x,
      barPt.y,
      plateRadius
    );
    plateGrad.addColorStop(0, "rgba(226, 232, 240, 0.95)");
    plateGrad.addColorStop(0.2, "rgba(15, 23, 42, 0.85)");
    plateGrad.addColorStop(0.25, maxPlate.color.replace(")", ", 0.45)").replace("rgb", "rgba"));
    plateGrad.addColorStop(0.85, maxPlate.color.replace(")", ", 0.55)").replace("rgb", "rgba"));
    plateGrad.addColorStop(1, maxPlate.color);

    ctx.beginPath();
    ctx.arc(barPt.x, barPt.y, plateRadius, 0, Math.PI * 2);
    ctx.fillStyle = plateGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = maxPlate.color;
    ctx.stroke();

    // Anel interno metálico IWF
    ctx.beginPath();
    ctx.arc(barPt.x, barPt.y, plateRadius * 0.32, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eixo central de aço
    ctx.beginPath();
    ctx.arc(barPt.x, barPt.y, scale * 0.025, 0, Math.PI * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();

    ctx.restore();
  }

  private static drawFrontView(
    ctx: CanvasRenderingContext2D,
    originX: number,
    floorY: number,
    scale: number,
    frame: InterpolatedFrame,
    plates: ReturnType<typeof PhysicsEngine.getPlatesPerSleeve>
  ): void {
    const yWrist = floorY - frame.joints.wrist.y * scale;
    const barHalfWidth = scale * 0.95;

    ctx.save();

    // Eixo de aço olímpico cromado (2.20m padrão masculino)
    ctx.beginPath();
    ctx.moveTo(originX - barHalfWidth, yWrist);
    ctx.lineTo(originX + barHalfWidth, yWrist);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#e2e8f0";
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Anilhas IWF carregadas nas duas extremidades
    const officialRadius = scale * 0.225;

    [-1, 1].forEach((side) => {
      const baseSleeveX = originX + side * (scale * 0.66);
      let offset = 0;

      for (const pl of plates) {
        const plateWidth = scale * 0.042 * pl.widthRatio;
        const plateHeight = officialRadius * 2 * pl.diameterRatio;
        const px = side === 1 ? baseSleeveX + offset : baseSleeveX - offset - plateWidth;

        ctx.fillStyle = pl.color;
        ctx.beginPath();
        ctx.roundRect(px, yWrist - plateHeight / 2, plateWidth, plateHeight, 3);
        ctx.fill();
        ctx.strokeStyle = pl.borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        offset += plateWidth + 2;
      }

      // Presilha / Collar de competição (2.5kg metálica)
      const collarWidth = scale * 0.025;
      const collarHeight = officialRadius * 0.9;
      const cx = side === 1 ? baseSleeveX + offset : baseSleeveX - offset - collarWidth;

      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.roundRect(cx, yWrist - collarHeight / 2, collarWidth, collarHeight, 2);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }
}
