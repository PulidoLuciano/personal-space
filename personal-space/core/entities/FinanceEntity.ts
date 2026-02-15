export interface FinanceProps {
  id?: number;
  projectId: number;
  taskId?: number;
  eventId?: number;
  habitId?: number;
  amount: number;
  currencyId: number;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export class FinanceEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly taskId?: number;
  public readonly eventId?: number;
  public readonly habitId?: number;
  public readonly amount: number;
  public readonly currencyId: number;
  public readonly title: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: FinanceProps) {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("La transacción financiera debe tener un título.");
    }

    if (props.amount <= 0) {
      throw new Error("El monto de la transacción debe ser mayor a cero.");
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.taskId = props.taskId;
    this.eventId = props.eventId;
    this.habitId = props.habitId;
    this.amount = props.amount;
    this.currencyId = props.currencyId;
    this.title = props.title.trim();
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Transforma datos crudos de SQLite a la Entidad.
   */
  static fromDatabase(row: any): FinanceEntity {
    return new FinanceEntity({
      id: row.id,
      projectId: row.project_id,
      taskId: row.task_id || undefined,
      eventId: row.event_id || undefined,
      habitId: row.habit_id || undefined,
      amount: row.amount,
      currencyId: row.currency_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
