import { SQLiteBindParams, SQLiteDatabase } from "expo-sqlite";

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
 * Clase base abstracta para repositorios de SQLite.
 * Proporciona métodos CRUD genéricos y un constructor de consultas dinámico.
 * @template T El tipo de la entidad que maneja el repositorio.
 */
export abstract class BaseRepository<T> {
  protected db: SQLiteDatabase;
  protected tableName: string;

  constructor(db: SQLiteDatabase, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Construye dinámicamente la cláusula WHERE y extrae los valores para los placeholders.
   * Maneja casos especiales para operadores de nulidad (IS NULL) y listas (IN).
   * @param criteria Array de objetos de criterio de consulta.
   * @returns Un objeto con el string de la cláusula y el array de valores.
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
        const placeholders = c.value.map(() => "?").join(", ");
        values.push(...c.value);
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
   * @param columns Array opcional de columnas a seleccionar (keyof T).
   * @returns Promesa con un array de todos los registros de tipo T.
   */
  async getAll(columns: (keyof T)[] = []): Promise<T[]> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const query = `SELECT ${selectedColumns} FROM ${this.tableName};`;
    return await this.db.getAllAsync<T>(query);
  }

  /**
   * Obtiene un único registro por su identificador primario.
   * @param id El ID del registro (number o string).
   * @param columns Array opcional de columnas a seleccionar.
   * @returns Promesa con el objeto T o null si no se encuentra.
   */
  async getById(
    id: number | string,
    columns: (keyof T)[] = [],
  ): Promise<T | null> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const query = `SELECT ${selectedColumns} FROM ${this.tableName} WHERE id = ?;`;
    return await this.db.getFirstAsync<T>(query, [id]);
  }

  /**
   * Busca registros que coincidan con múltiples criterios de filtrado.
   * @param criteria Lista de objetos QueryCriteria para filtrar (column, operator, value).
   * @param columns Array opcional de columnas a seleccionar.
   * @returns Promesa con un array de registros que cumplen las condiciones.
   */
  async find(
    criteria: QueryCriteria<T>[],
    columns: (keyof T)[] = [],
  ): Promise<T[]> {
    const selectedColumns = columns.length > 0 ? columns.join(", ") : "*";
    const { where, values } = this.buildWhereClause(criteria);
    const query = `SELECT ${selectedColumns} FROM ${this.tableName} ${where};`;
    return await this.db.getAllAsync<T>(query, values);
  }

  /**
   * Recupera una lista de registros paginada con filtrado opcional.
   * @param page Número de página (empezando en 1).
   * @param pageSize Cantidad de registros por página.
   * @param criteria Lista opcional de criterios de filtrado.
   * @param columns Array opcional de columnas a seleccionar.
   * @returns Promesa con un array de registros paginados.
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

    return await this.db.getAllAsync<T>(query, [...values, pageSize, offset]);
  }

  /**
   * Inserta un nuevo registro en la base de datos.
   * @param data Objeto con las llaves y valores a insertar.
   * @returns Promesa con el ID generado para el nuevo registro.
   */
  async create(data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders});`;

    const result = await this.db.runAsync(query, [
      ...values,
    ] as SQLiteBindParams);
    return result.lastInsertRowId;
  }

  /**
   * Actualiza un registro existente basándose en su ID.
   * @param id El ID del registro a modificar.
   * @param data Objeto con los campos a actualizar.
   * @returns Promesa de vacío al completar la operación.
   */
  async update(id: number | string, data: Partial<T>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;

    await this.db.runAsync(query, [...values, id] as SQLiteBindParams);
  }

  /**
   * Elimina un registro de forma permanente.
   * @param id El ID del registro a borrar.
   * @returns Promesa de vacío.
   */
  async delete(id: number | string): Promise<void> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?;`;
    await this.db.runAsync(query, [id]);
  }

  /**
   * Cuenta el total de registros en la tabla.
   * @returns Promesa con el número total de registros.
   */
  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName};`;
    const result = await this.db.getFirstAsync<{ total: number }>(query);
    return result?.total || 0;
  }
}
