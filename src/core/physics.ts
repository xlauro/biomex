import type { BarDynamics } from "../types/kinematics";

export interface PlateSpec {
  weightKg: number;
  color: string;
  borderColor: string;
  diameterRatio: number; // Ratio em relação ao diâmetro padrão oficial (450mm)
  widthRatio: number;    // Espessura relativa
}

export const IWF_PLATES: PlateSpec[] = [
  { weightKg: 25, color: "#ef4444", borderColor: "#b91c1c", diameterRatio: 1.0, widthRatio: 1.0 },
  { weightKg: 20, color: "#3b82f6", borderColor: "#1d4ed8", diameterRatio: 0.98, widthRatio: 0.85 },
  { weightKg: 15, color: "#eab308", borderColor: "#ca8a04", diameterRatio: 0.94, widthRatio: 0.72 },
  { weightKg: 10, color: "#10b981", borderColor: "#047857", diameterRatio: 0.9, widthRatio: 0.58 },
  { weightKg: 5,  color: "#f8fafc", borderColor: "#94a3b8", diameterRatio: 0.68, widthRatio: 0.42 },
  { weightKg: 2.5, color: "#0f172a", borderColor: "#64748b", diameterRatio: 0.52, widthRatio: 0.35 },
];

export class PhysicsEngine {
  static readonly GRAVITY = 9.81; // m/s²
  static readonly BARBELL_BASE_WEIGHT = 20; // Barra olímpica masculina padrão (20kg)

  /**
   * Calcula a força vertical instantânea aplicada à barra (Newtons)
   * F = m * (g + a)
   */
  static calculateBarForce(barMassKg: number, acceleration: number): number {
    const effectiveA = Math.max(-PhysicsEngine.GRAVITY, acceleration);
    return barMassKg * (PhysicsEngine.GRAVITY + effectiveA);
  }

  /**
   * Calcula a potência mecânica instantânea (Watts)
   * P = F * v
   */
  static calculatePower(forceN: number, velocity: number): number {
    return Math.max(0, forceN * velocity);
  }

  /**
   * Calcula a Força de Reação do Solo (FRS) total em múltiplos do peso corporal do atleta
   */
  static calculateGroundReactionRatio(
    athleteMassKg: number,
    barMassKg: number,
    barAcceleration: number
  ): number {
    const athleteWeightN = athleteMassKg * PhysicsEngine.GRAVITY;
    const barForceN = PhysicsEngine.calculateBarForce(barMassKg, barAcceleration);
    const totalGroundForceN = athleteWeightN + barForceN;

    return totalGroundForceN / athleteWeightN;
  }

  /**
   * Determina a combinação ótima de anilhas olímpicas IWF para cada lado da barra
   */
  static getPlatesPerSleeve(totalBarWeightKg: number): PlateSpec[] {
    const weightPerSide = Math.max(0, (totalBarWeightKg - PhysicsEngine.BARBELL_BASE_WEIGHT) / 2);
    let remaining = weightPerSide;
    const plates: PlateSpec[] = [];

    for (const plate of IWF_PLATES) {
      while (remaining >= plate.weightKg - 0.01) {
        plates.push(plate);
        remaining -= plate.weightKg;
      }
    }

    return plates;
  }
}
