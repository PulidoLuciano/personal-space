import type { DBClient } from "../index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Tipos de operadores permitidos para las consultas avanzadas.
 */
export type FilterOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "LIKE"
  | "IN"
  | "IS NULL"
  | "IS NOT NULL";

/**
 * Interfaz para definir criterios de filtrado.
 * @template T El tipo de la entidad (ej. Task, Project).
 */
export interface QueryCriteria<T> {
  column: keyof T;
  operator: FilterOperator;
  value?: any;
}

/**
 * Clase base abstracta para repositorios usando el adaptador universal DBClient.
 * Proporciona métodos CRUD genéricos y un constructor de consultas dinámico.
 * @template T El tipo de la entidad que maneja el repositorio.
 */
export abstract class BaseRepository<T> {
  protected db: DBClient;
  protected tableName: string;

  constructor(db: DBClient, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Construye dinámicamente la cláusula WHERE y extrae los valores para los placeholders.
   */
  private buildWhereClause(criteria: QueryCriteria<T>[]): {
    where: string;
    values: any[];
  } {
    if (criteria.length === 0) return { where: "", values: [] };

    const values: any[] = [];
    const clauses = criteria.map((c) => {
      if (c.operator === "IS NULL" || c.operator === "IS NOT NULL") {
        return `${String(c.column)} ${c.operator}`;
      }

      if (c.operator === "IN") {
        // Asumimos que c.value es un array
        const placeholders = (c.value as any[]).map(() => "?").join(", ");
        values.push(...(c.value as any[]));
        return `${String(c.column)} IN (${placeholders})`;
      }

      values.push(c.value);
      return `${String(c.column)} ${c.operator} ?`;
    });

    return {
      where: `WHERE ${clauses.join(" AND ")}`,
      values,
    };
  }

  /**
   * Obtiene todos los registros de la tabla.
   */
  async getAll(columns: (keyof T)[] = []): Promise<T[]> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const query = `SELECT ${selectedColumns} FROM ${this.tableName} WHERE is_deleted = FALSE;`;
    return await this.db.query<T>(query);
  }

  /**
   * Obtiene un único registro por su identificador primario.
   */
  async getById(
    id: number | string,
    columns: (keyof T)[] = [],
  ): Promise<T | null> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const query = `SELECT ${selectedColumns} FROM ${this.tableName} WHERE id = ? AND is_deleted = FALSE;`;
    const result = await this.db.queryOne<T>(query, [id]);
    return result ?? null;
  }

  /**
   * Busca registros que coincidan con múltiples criterios de filtrado.
   */
  async find(
    criteria: QueryCriteria<T>[],
    columns: (keyof T)[] = [],
  ): Promise<T[]> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const { where, values } = this.buildWhereClause(criteria);
    const query = `SELECT ${selectedColumns} FROM ${this.tableName} ${where};`;
    return await this.db.query<T>(query, values);
  }

  /**
   * Recupera una lista de registros paginada con filtrado opcional.
   */
  async paginate(
    page: number,
    pageSize: number,
    criteria: QueryCriteria<T>[] = [],
    columns: (keyof T)[] = [],
  ): Promise<T[]> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const { where, values } = this.buildWhereClause(criteria);
    const offset = (page - 1) * pageSize;

    const query = `
      SELECT ${selectedColumns} 
      FROM ${this.tableName} 
      ${where} 
      LIMIT ? OFFSET ?;
    `;

    return await this.db.query<T>(query, [...values, pageSize, offset]);
  }

  /**
   * Inserta un nuevo registro en la base de datos.
   */
  async create(data: Partial<T>): Promise<string> {
    const dataWithDefaults = {
      id: uuidv4(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    const keys = Object.keys(dataWithDefaults);
    const values = Object.values(dataWithDefaults);
    const placeholders = keys.map(() => "?").join(", ");
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders});`;

    await this.db.execute(query, values);
    return dataWithDefaults.id;
  }

  /**
   * Actualiza un registro existente basándose en su ID.
   */
  async update(id: number | string, data: Partial<T>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?;`;

    await this.db.execute(query, [...values, id]);
  }

  /**
   * Elimina un registro de forma permanente.
   */
  async delete(id: number | string): Promise<void> {
    const query = `UPDATE ${this.tableName} SET is_deleted = TRUE WHERE id = ?;`;
    await this.db.execute(query, [id]);
  }

  /**
   * Cuenta el total de registros en la tabla.
   */
  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE is_deleted = FALSE;`;
    const result = await this.db.queryOne<{ total: number }>(query);
    return result?.total || 0;
  }
}
