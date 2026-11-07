import type { Movement, MovementId } from "../../types/movement";
import { SNATCH_MOVEMENT } from "./snatch";
import { CLEAN_AND_JERK_MOVEMENT } from "./cleanAndJerk";

export class MovementRegistry {
  private static movements: Map<MovementId, Movement> = new Map([
    [SNATCH_MOVEMENT.id, SNATCH_MOVEMENT],
    [CLEAN_AND_JERK_MOVEMENT.id, CLEAN_AND_JERK_MOVEMENT],
  ]);

  static getAll(): Movement[] {
    return Array.from(MovementRegistry.movements.values());
  }

  static get(id: MovementId): Movement {
    const movement = MovementRegistry.movements.get(id);
    if (!movement) {
      return SNATCH_MOVEMENT;
    }
    return movement;
  }

  static register(movement: Movement): void {
    MovementRegistry.movements.set(movement.id, movement);
  }
}
