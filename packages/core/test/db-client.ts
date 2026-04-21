import Database from 'better-sqlite3';
import type { DBClient } from '../src/database/index.js';

function serializeValue(value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (value === undefined) {
    return null;
  }
  return value;
}

export function createInMemoryDB(): DBClient {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');

  const client: DBClient = {
    query: async <T>(sql: string, params?: any[]): Promise<T[]> => {
      const stmt = db.prepare(sql);
      return stmt.all(...(params || [])) as T[];
    },
    queryOne: async <T>(sql: string, params?: any[]): Promise<T | undefined> => {
      const stmt = db.prepare(sql);
      return stmt.get(...(params || [])) as T | undefined;
    },
    execute: async (sql: string, params?: any[]): Promise<{ insertId?: number | bigint; changes: number }> => {
      const stmt = db.prepare(sql);
      const serializedParams = (params || []).map(serializeValue);
      const result = stmt.run(...serializedParams);
      return { insertId: result.lastInsertRowid, changes: result.changes };
    },
  };

  return client;
}