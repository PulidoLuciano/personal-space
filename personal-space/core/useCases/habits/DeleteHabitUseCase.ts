import { HabitRepository } from "@/database/repositories/HabitRepository";

export class DeleteHabitUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(id: number): Promise<void> {
    await this.habitRepo.delete(id);
  }
}
