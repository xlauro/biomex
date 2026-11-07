import type { ChartSample } from "../types/telemetry";

export class KinematicChartsUI {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private chartData: ChartSample[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Falha ao obter contexto 2D para o gráfico");
    this.ctx = context;
  }

  setChartData(data: ChartSample[]): void {
    this.chartData = data;
    this.render(0);
  }

  render(currentProgress: number): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect() ?? {
      width: 400,
      height: 180,
    };
    const dpr = window.devicePixelRatio || 1;

    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);

    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    const width = rect.width;
    const height = rect.height;

    this.ctx.save();
    this.ctx.scale(dpr, dpr);

    // Fundo do gráfico
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    this.ctx.fillRect(0, 0, width, height);

    if (this.chartData.length < 2) {
      this.ctx.restore();
      return;
    }

    // Grid e eixos
    this.ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    this.ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 35) {
      this.ctx.beginPath();
      this.ctx.moveTo(30, y);
      this.ctx.lineTo(width - 10, y);
      this.ctx.stroke();
    }

    // Calcular valores máximos para normalização
    let maxVel = 0.5;
    let maxPower = 500;
    for (const d of this.chartData) {
      if (d.barVelocity > maxVel) maxVel = d.barVelocity;
      if (d.barPower > maxPower) maxPower = d.barPower;
    }

    const padLeft = 35;
    const padRight = 15;
    const padTop = 20;
    const padBottom = 25;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // 1. Curva de Potência (Watts) - Gradiente Âmbar
    this.ctx.beginPath();
    for (let i = 0; i < this.chartData.length; i++) {
      const d = this.chartData[i]!;
      const x = padLeft + (i / (this.chartData.length - 1)) * plotW;
      const normY = Math.max(0, d.barPower / maxPower);
      const y = padTop + (1 - normY) * plotH;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 2. Curva de Velocidade (m/s) - Ciano Vibrante
    this.ctx.beginPath();
    for (let i = 0; i < this.chartData.length; i++) {
      const d = this.chartData[i]!;
      const x = padLeft + (i / (this.chartData.length - 1)) * plotW;
      const normY = Math.max(0, d.barVelocity / maxVel);
      const y = padTop + (1 - normY) * plotH;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = "#38bdf8";
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // 3. Linha do Cursor Temporal Atual (Playhead)
    const playheadX = padLeft + currentProgress * plotW;
    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.beginPath();
    this.ctx.moveTo(playheadX, padTop);
    this.ctx.lineTo(playheadX, height - padBottom);
    this.ctx.stroke();

    // Bolinha luminosa no cursor
    const sampleIdx = Math.min(
      this.chartData.length - 1,
      Math.floor(currentProgress * this.chartData.length)
    );
    const activeSample = this.chartData[sampleIdx];
    if (activeSample) {
      const ptVelY = padTop + (1 - Math.max(0, activeSample.barVelocity / maxVel)) * plotH;
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.arc(playheadX, ptVelY, 4.5, 0, Math.PI * 2);
      this.ctx.fillStyle = "#38bdf8";
      this.ctx.shadowColor = "#38bdf8";
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
    }
    this.ctx.restore();

    // Legenda no topo
    this.ctx.font = '10px "JetBrains Mono", monospace';
    this.ctx.fillStyle = "#38bdf8";
    this.ctx.fillText(`— Vel (${maxVel.toFixed(1)} m/s)`, padLeft, 14);

    this.ctx.fillStyle = "#fbbf24";
    this.ctx.fillText(`— Potência (${Math.round(maxPower)} W)`, padLeft + 120, 14);

    this.ctx.restore();
  }
}
