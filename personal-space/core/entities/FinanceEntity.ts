export interface FinanceProps {
  id?: number;
  projectId: number;
  taskId?: number;
  eventId?: number;
  isIncome: boolean;
  amount: number;
  date?: Date;
  description?: string;
}

export class FinanceEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly taskId?: number;
  public readonly eventId?: number;
  public readonly isIncome: boolean;
  public readonly amount: number;
  public readonly date: Date;
  public readonly description?: string;

  constructor(props: FinanceProps) {
    if (props.amount <= 0) {
      throw new Error("El monto de la transacción debe ser mayor a cero.");
    }

    if (!props.projectId) {
      throw new Error(
        "Toda transacción financiera debe estar vinculada a un proyecto.",
      );
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.taskId = props.taskId;
    this.eventId = props.eventId;
    this.isIncome = props.isIncome;
    this.amount = props.amount;
    this.date = props.date || new Date();
    this.description = props.description?.trim();
  }

  /**
   * Transforma datos crudos de SQLite (donde booleanos son 0/1) a la Entidad.
   */
  static fromDatabase(row: any): FinanceEntity {
    return new FinanceEntity({
      id: row.id,
      projectId: row.project_id,
      taskId: row.task_id || undefined,
      eventId: row.event_id || undefined,
      isIncome: Boolean(row.is_income),
      amount: row.amount,
      date: new Date(row.date),
      description: row.description,
    });
  }

  /**
   * Devuelve el monto con el signo correspondiente para cálculos matemáticos.
   */
  get signedAmount(): number {
    return this.isIncome ? this.amount : -this.amount;
  }

  /**
   * Formateador básico para la UI.
   */
  get formattedAmount(): string {
    const symbol = this.isIncome ? "+" : "-";
    return `${symbol} $${this.amount.toLocaleString()}`;
  }
}
