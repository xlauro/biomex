export interface Point2D {
  x: number;
  y: number;
}

export interface Joints {
  ankle: Point2D;
  knee: Point2D;
  hip: Point2D;
  shoulder: Point2D;
  elbow: Point2D;
  wrist: Point2D;
  head: Point2D;
  rearLeg?: {
    ankle: Point2D;
    knee: Point2D;
  };
}

export type JointName = keyof Joints;

export interface JointAngles {
  knee: number;     // Ângulo de flexão/extensão do joelho (graus)
  hip: number;      // Ângulo do quadril (graus)
  ankle: number;    // Ângulo tíbia vs solo (graus)
  trunk: number;    // Ângulo de inclinação do tronco vs horizontal (graus)
  elbow: number;    // Ângulo de flexão/extensão do cotovelo (graus)
  shoulder: number; // Ângulo de flexão do ombro (graus)
}

export interface BarDynamics {
  heightM: number;       // Altura da barra do solo em metros
  velocity: number;      // Velocidade vertical instantânea (m/s)
  acceleration: number;  // Aceleração vertical instantânea (m/s²)
  forceN: number;        // Força vertical total aplicada (Newtons: m*(g + a))
  powerWatts: number;    // Potência mecânica instantânea (P = F * v, Watts)
  workJoules: number;    // Trabalho mecânico acumulado (Joules)
}
