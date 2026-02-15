export interface FinanceExecutionProps {
  id?: number;
  financeId?: number;
  date: string;
  amount: number;
  currencyId: number;
  createdAt?: string;
  updatedAt?: string;
}

export class FinanceExecutionEntity {
  public readonly id?: number;
  public readonly financeId?: number;
  public readonly date: string;
  public readonly amount: number;
  public readonly currencyId: number;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: FinanceExecutionProps) {
    if (!props.date) {
      throw new Error("La ejecución financiera debe tener una fecha.");
    }

    if (props.amount < 0) {
      throw new Error("El monto de la ejecución no puede ser negativo.");
    }

    this.id = props.id;
    this.financeId = props.financeId;
    this.date = props.date;
    this.amount = props.amount;
    this.currencyId = props.currencyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): FinanceExecutionEntity {
    return new FinanceExecutionEntity({
      id: row.id,
      financeId: row.finance_id || undefined,
      date: row.date,
      amount: row.amount,
      currencyId: row.currency_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
