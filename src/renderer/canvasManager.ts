import { AppState } from "../engine/state";

export interface ViewportTransform {
  width: number;
  height: number;
  dpr: number;
  originX: number;
  floorY: number;
  scale: number; // Pixels por metro
  zoom: number;
  panX: number;
  panY: number;
}

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state = AppState.getInstance();
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private isPinching: boolean = false;
  private initialPinchDist: number = 0;
  private initialPinchZoom: number = 1.0;
  private lastTapTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Não foi possível inicializar CanvasRenderingContext2D");
    this.ctx = context;

    this.setupInteractions();
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private setupInteractions(): void {
    // Zoom com a roda do mouse (centrado no cursor)
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const current = this.state.get();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      const nextZoom = Math.max(0.6, Math.min(3.5, current.zoom * zoomFactor));

      this.state.update({ zoom: nextZoom });
    }, { passive: false });

    // Pan com clique e arrasto
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.canvas.style.cursor = "grabbing";
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const current = this.state.get();
      this.state.update({
        panX: current.panX + dx,
        panY: current.panY + dy,
      });
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = "grab";
      }
    });

    // Double-click para resetar zoom e pan
    this.canvas.addEventListener("dblclick", () => {
      this.state.resetCamera();
    });

    // Suporte a Toque em Dispositivos Móveis (1 dedo: Pan, 2 dedos: Pinch-to-Zoom)
    this.canvas.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0]!;
          this.isDragging = true;
          this.isPinching = false;
          this.dragStartX = touch.clientX;
          this.dragStartY = touch.clientY;

          // Double tap para resetar no celular
          const now = Date.now();
          if (now - this.lastTapTime < 300) {
            this.state.resetCamera();
            this.lastTapTime = 0;
          } else {
            this.lastTapTime = now;
          }
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          this.isPinching = true;
          const t1 = e.touches[0]!;
          const t2 = e.touches[1]!;
          this.initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          this.initialPinchZoom = this.state.get().zoom;
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (this.isDragging && e.touches.length === 1) {
          const touch = e.touches[0]!;
          const dx = touch.clientX - this.dragStartX;
          const dy = touch.clientY - this.dragStartY;
          this.dragStartX = touch.clientX;
          this.dragStartY = touch.clientY;

          const current = this.state.get();
          this.state.update({
            panX: current.panX + dx,
            panY: current.panY + dy,
          });
        } else if (this.isPinching && e.touches.length === 2) {
          const t1 = e.touches[0]!;
          const t2 = e.touches[1]!;
          const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          if (this.initialPinchDist > 0) {
            const factor = currentDist / this.initialPinchDist;
            const nextZoom = Math.max(0.6, Math.min(3.5, this.initialPinchZoom * factor));
            this.state.update({ zoom: nextZoom });
          }
        }
      },
      { passive: true }
    );

    const endTouch = () => {
      this.isDragging = false;
      this.isPinching = false;
    };
    this.canvas.addEventListener("touchend", endTouch);
    this.canvas.addEventListener("touchcancel", endTouch);
  }

  /**
   * Prepara o frame, ajusta dimensões com DPR e aplica transformação de câmera (Zoom e Pan)
   */
  beginFrame(): ViewportTransform {
    const rect = this.canvas.parentElement?.getBoundingClientRect() ?? {
      width: 800,
      height: 500,
    };
    const dpr = window.devicePixelRatio || 1;

    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
    }

    const currentState = this.state.get();
    const width = rect.width;
    const height = rect.height;

    this.ctx.save();
    this.ctx.scale(dpr, dpr);

    // Fundo escuro esportivo
    this.ctx.fillStyle = "#070b14";
    this.ctx.fillRect(0, 0, width, height);

    // Aplica translação e escala do Pan e Zoom
    const originX = width * 0.5 + currentState.panX;
    const floorY = height * 0.86 + currentState.panY;
    const scale = Math.max(10, ((height * 0.72) / 2.0) * currentState.zoom);

    return {
      width,
      height,
      dpr,
      originX,
      floorY,
      scale,
      zoom: currentState.zoom,
      panX: currentState.panX,
      panY: currentState.panY,
    };
  }

  endFrame(): void {
    this.ctx.restore();
  }
}
