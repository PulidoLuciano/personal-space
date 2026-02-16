import { HabitRepository } from "@/database/repositories/HabitRepository";
import { HabitEntity } from "@/core/entities/HabitEntity";

export class GetHabitsByProjectUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(projectId: number): Promise<HabitEntity[]> {
    const habits = await this.habitRepo.getByProject(projectId);
    return habits.map((h) => HabitEntity.fromDatabase(h));
  }
}
