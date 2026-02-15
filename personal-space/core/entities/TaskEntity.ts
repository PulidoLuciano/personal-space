export interface TaskProps {
  id?: number;
  projectId: number;
  habitId?: number;
  title: string;
  dueDate?: string;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  completitionBy?: number;
  countGoal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class TaskEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly habitId?: number;
  public readonly title: string;
  public readonly dueDate?: string;
  public readonly locationName?: string;
  public readonly locationLat?: number;
  public readonly locationLon?: number;
  public readonly completitionBy?: number;
  public readonly countGoal: number;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: TaskProps) {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("La tarea debe tener un título.");
    }

    if (props.countGoal !== undefined && props.countGoal <= 0) {
      throw new Error("El objetivo de completado debe ser mayor a cero.");
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.habitId = props.habitId;
    this.title = props.title.trim();
    this.dueDate = props.dueDate;
    this.locationName = props.locationName?.trim();
    this.locationLat = props.locationLat;
    this.locationLon = props.locationLon;
    this.completitionBy = props.completitionBy;
    this.countGoal = props.countGoal ?? 1;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): TaskEntity {
    return new TaskEntity({
      id: row.id,
      projectId: row.project_id,
      habitId: row.habit_id || undefined,
      title: row.title,
      dueDate: row.due_date,
      locationName: row.location_name,
      locationLat: row.location_lat,
      locationLon: row.location_lon,
      completitionBy: row.completition_by,
      countGoal: row.count_goal,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
