export interface DBClient {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | undefined>;
  execute(
    sql: string,
    params?: any[],
  ): Promise<{ insertId?: number | bigint; changes: number }>;
}

export async function testDatabase(db: DBClient) {
  const result = await db.queryOne<{ version: string }>(
    "SELECT sqlite_version() as version;",
  );
  return result?.version;
}

export async function sumSql(db: DBClient) {
  const result = await db.queryOne<{ answer: number }>(
    "SELECT ? + ? as answer",
    [10, 5],
  );
  return result?.answer;
}
