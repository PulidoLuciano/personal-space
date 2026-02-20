import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@personal-space/db/schema";
import { seedDatabase } from "@personal-space/db/seed";
import { migrations } from "@personal-space/db/migrations";

import type { PersonalSpaceDB } from "@personal-space/db";

let db: PersonalSpaceDB | undefined;
let seeded = false;

async function runMigrations(database: Database): Promise<void> {
  console.log("[DB] Starting migrations...");
  console.log(`[DB] Found ${migrations.length} migration(s)`);

  for (const migration of migrations) {
    const statements = migration.sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`[DB] Running migration: ${migration.name} (${statements.length} statements)`);

    for (const statement of statements) {
      try {
        await database.execute(statement);
      } catch (err) {
        console.error(`[DB] Migration error: ${err}`);
      }
    }
  }
  console.log("[DB] Migrations completed!");
}

export async function initDatabase(): Promise<PersonalSpaceDB> {
  if (db) return db;

  console.log("[DB] Initializing database...");

  try {
    const tauriDb = await Database.load("sqlite:personal-space.db");
    console.log("[DB] Database loaded");

    const driver = async (
      sql: string,
      params: unknown[],
      method: string,
    ): Promise<{ rows: unknown[] }> => {
      if (method === "all" || method === "get" || method === "values") {
        const rows = (await tauriDb.select(sql, params)) as unknown[];
        return { rows };
      } else {
        await tauriDb.execute(sql, params);
        return { rows: [] };
      }
    };

    db = drizzle(driver, { schema }) as unknown as PersonalSpaceDB;

    await runMigrations(tauriDb);

    if (!seeded) {
      console.log("[DB] Starting seeding...");
      await seedDatabase(db);
      seeded = true;
    }

    console.log("[DB] Database ready!");
  } catch (err) {
    console.error("[DB] Error initializing database:", err);
  }

  return db!;
}

export function getDatabase(): PersonalSpaceDB {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
