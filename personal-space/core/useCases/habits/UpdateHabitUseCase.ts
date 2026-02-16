import { HabitRepository } from "@/database/repositories/HabitRepository";
import { habitEvents, HABIT_CHANGED } from "@/utils/events/HabitEvents";

export class UpdateHabitUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(
    id: number,
    data: {
      isStrict?: boolean;
      title?: string;
      dueMinutes?: number;
      locationName?: string;
      locationLat?: number;
      locationLon?: number;
      completitionBy?: number;
      countGoal?: number;
      beginAt?: string;
      recurrenceRule?: string;
    }
  ): Promise<void> {
    const habit = await this.habitRepo.getById(id);
    await this.habitRepo.update(id, data);
    
    if (habit) {
      habitEvents.emit(HABIT_CHANGED, { projectId: habit.project_id, habitId: id });
    }
  }
}
