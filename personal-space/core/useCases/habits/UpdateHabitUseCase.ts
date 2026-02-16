import { HabitRepository } from "@/database/repositories/HabitRepository";

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
    await this.habitRepo.update(id, data);
  }
}
