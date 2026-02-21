import * as SQLite from "expo-sqlite";
import { DBClient } from "personal-space-core";

const sqlite = SQLite.openDatabaseSync("personal-space.db");

export const db: DBClient = {
  query: async (sql, params = []) => {
    return (await sqlite.getAllAsync(sql, params)) as any[];
  },
  queryOne: async (sql, params = []) => {
    return (await sqlite.getFirstAsync(sql, params)) as any;
  },
  execute: async (sql, params = []) => {
    const result = await sqlite.runAsync(sql, params);
    return {
      insertId: result.lastInsertRowId,
      changes: result.changes,
    };
  },
};
