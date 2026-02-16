import { HabitRepository } from "@/database/repositories/HabitRepository";
import { habitEvents, HABIT_CHANGED } from "@/utils/events/HabitEvents";

export class DeleteHabitUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(id: number): Promise<void> {
    const habit = await this.habitRepo.getById(id);
    await this.habitRepo.delete(id);
    
    if (habit) {
      habitEvents.emit(HABIT_CHANGED, { projectId: habit.project_id, habitId: id });
    }
  }
}
