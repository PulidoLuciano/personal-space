export interface CurrencyProps {
  id?: number;
  name: string;
  symbol: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CurrencyEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly symbol: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: CurrencyProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("La moneda debe tener un nombre.");
    }

    if (!props.symbol || props.symbol.trim().length === 0) {
      throw new Error("La moneda debe tener un símbolo.");
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.symbol = props.symbol.trim();
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): CurrencyEntity {
    return new CurrencyEntity({
      id: row.id,
      name: row.name,
      symbol: row.symbol,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
