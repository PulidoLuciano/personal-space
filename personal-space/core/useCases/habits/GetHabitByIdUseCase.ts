import { HabitRepository, HabitData } from "@/database/repositories/HabitRepository";
import { HabitEntity } from "@/core/entities/HabitEntity";

export class GetHabitByIdUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(id: number): Promise<HabitEntity | null> {
    const data = await this.habitRepo.getById(id);
    if (!data) return null;
    return HabitEntity.fromDatabase(data);
  }
}
