export interface TaskExecutionProps {
  id?: number;
  taskId?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TaskExecutionEntity {
  public readonly id?: number;
  public readonly taskId?: number;
  public readonly startTime?: string;
  public readonly endTime?: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: TaskExecutionProps) {
    if (props.startTime && props.endTime && props.startTime > props.endTime) {
      throw new Error("La hora de inicio debe ser anterior a la hora de fin.");
    }

    this.id = props.id;
    this.taskId = props.taskId;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): TaskExecutionEntity {
    return new TaskExecutionEntity({
      id: row.id,
      taskId: row.task_id || undefined,
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  get durationMinutes(): number | null {
    if (!this.startTime || !this.endTime) return null;
    const start = new Date(this.startTime).getTime();
    const end = new Date(this.endTime).getTime();
    return Math.round((end - start) / 60000);
  }
}
