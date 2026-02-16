import { HabitRepository } from "@/database/repositories/HabitRepository";
import { HabitEntity } from "@/core/entities/HabitEntity";

export class CreateHabitUseCase {
  constructor(private habitRepo: HabitRepository) {}

  async execute(props: {
    projectId: number;
    isStrict?: boolean;
    title: string;
    dueMinutes?: number;
    locationName?: string;
    locationLat?: number;
    locationLon?: number;
    completitionBy?: number;
    countGoal?: number;
    beginAt?: string;
    recurrenceRule?: string;
  }): Promise<number> {
    const habit = new HabitEntity({
      projectId: props.projectId,
      isStrict: props.isStrict,
      title: props.title,
      dueMinutes: props.dueMinutes,
      locationName: props.locationName,
      locationLat: props.locationLat,
      locationLon: props.locationLon,
      completitionBy: props.completitionBy,
      countGoal: props.countGoal,
      beginAt: props.beginAt,
      recurrenceRule: props.recurrenceRule,
    });

    const id = await this.habitRepo.create({
      projectId: habit.projectId,
      isStrict: habit.isStrict,
      title: habit.title,
      dueMinutes: habit.dueMinutes,
      locationName: habit.locationName,
      locationLat: habit.locationLat,
      locationLon: habit.locationLon,
      completitionBy: habit.completitionBy,
      countGoal: habit.countGoal,
      beginAt: habit.beginAt,
      recurrenceRule: habit.recurrenceRule,
    });

    return id;
  }
}
