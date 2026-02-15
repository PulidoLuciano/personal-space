export interface HabitProps {
  id?: number;
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
  createdAt?: string;
  updatedAt?: string;
}

export class HabitEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly isStrict: boolean;
  public readonly title: string;
  public readonly dueMinutes?: number;
  public readonly locationName?: string;
  public readonly locationLat?: number;
  public readonly locationLon?: number;
  public readonly completitionBy?: number;
  public readonly countGoal: number;
  public readonly beginAt?: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: HabitProps) {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("El hábito debe tener un título.");
    }

    if (props.dueMinutes !== undefined && props.dueMinutes <= 0) {
      throw new Error("Los minutos de vencimiento deben ser mayores a cero.");
    }

    if (props.countGoal !== undefined && props.countGoal <= 0) {
      throw new Error("El objetivo de completado debe ser mayor a cero.");
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.isStrict = props.isStrict ?? false;
    this.title = props.title.trim();
    this.dueMinutes = props.dueMinutes;
    this.locationName = props.locationName?.trim();
    this.locationLat = props.locationLat;
    this.locationLon = props.locationLon;
    this.completitionBy = props.completitionBy;
    this.countGoal = props.countGoal ?? 1;
    this.beginAt = props.beginAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): HabitEntity {
    return new HabitEntity({
      id: row.id,
      projectId: row.project_id,
      isStrict: Boolean(row.is_strict),
      title: row.title,
      dueMinutes: row.due_minutes,
      locationName: row.location_name,
      locationLat: row.location_lat,
      locationLon: row.location_lon,
      completitionBy: row.completition_by,
      countGoal: row.count_goal,
      beginAt: row.begin_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
