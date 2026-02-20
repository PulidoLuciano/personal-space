import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@personal-space/db/schema";
import { seedDatabase } from "@personal-space/db/seed";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTauriDbPath(): string {
  const homeDir = os.homedir();
  const configDir = process.env.XDG_CONFIG_HOME || path.join(homeDir, ".config");
  const appName = "com.luciano-pulido.desktop";
  return path.join(configDir, appName, "personal-space.db");
}

let db: BetterSQLite3Database<typeof schema> | undefined;
let seeded = false;

export function initDatabase(): BetterSQLite3Database<typeof schema> {
  if (db) return db;

  console.log("[DB] Initializing database...");

  const dbPath = getTauriDbPath();
  console.log(`[DB] Using database at: ${dbPath}`);

  const sqlite = new Database(dbPath);

  db = drizzle(sqlite, { schema });

  const migrationsPath = path.resolve(
    __dirname,
    "../../../../packages/db/migrations",
  );

  console.log("[DB] Running migrations...");
  migrate(db, { migrationsFolder: migrationsPath });
  console.log("[DB] Migrations completed!");

  if (!seeded) {
    console.log("[DB] Starting seeding...");
    seedDatabase(db);
    seeded = true;
  }

  console.log("[DB] Database ready!");

  return db;
}

export function getDatabase(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
