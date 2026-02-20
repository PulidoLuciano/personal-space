import { openDatabaseAsync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@personal-space/db/schema";
import { seedDatabase } from "@personal-space/db/seed";
import { migrations } from "@personal-space/db/migrations";

let db: ReturnType<typeof drizzle> | undefined;
let seeded = false;

async function runMigrations(): Promise<void> {
  console.log("[DB] Starting migrations...");
  console.log(`[DB] Found ${migrations.length} migration(s)`);
  
  const expoDb = await openDatabaseAsync("personal-space.db");

  for (const migration of migrations) {
    const statements = migration.sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`[DB] Running migration: ${migration.name} (${statements.length} statements)`);
    
    for (const statement of statements) {
      await expoDb.execAsync(statement);
    }
  }
  console.log("[DB] Migrations completed!");
}

export async function initDatabase() {
  if (db) return db;

  console.log("[DB] Initializing database...");
  
  const expoDb = await openDatabaseAsync("personal-space.db");

  db = drizzle(expoDb, { schema });

  await runMigrations();

  if (!seeded) {
    console.log("[DB] Starting seeding...");
    await seedDatabase(db);
    seeded = true;
  }

  console.log("[DB] Database ready!");

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
