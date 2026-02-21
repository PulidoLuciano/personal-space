import Database from "@tauri-apps/plugin-sql";
import type { DBClient } from "personal-space-core";

const sqlitePromise = Database.load("sqlite:personal-space.db");

export const db: DBClient = {
  query: async (sql, params = []) => {
    const sqlite = await sqlitePromise;
    return (await sqlite.select(sql, params)) as any[];
  },
  queryOne: async (sql, params = []) => {
    const sqlite = await sqlitePromise;
    const result = (await sqlite.select(sql, params)) as any[];
    return result[0];
  },
  execute: async (sql, params = []) => {
    const sqlite = await sqlitePromise;
    const result = await sqlite.execute(sql, params);
    return {
      insertId: result.lastInsertId,
      changes: result.rowsAffected,
    };
  },
};
