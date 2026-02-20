import { ExtractTablesWithRelations } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

export { schema };
export * from "./schema";
export * from "./seed";
export * from "./migrations";
export * from "./zod";

export type PersonalSpaceDB = BaseSQLiteDatabase<
  any, // Bypasses the strict "sync" vs "async" driver conflict
  any, // Bypasses specific run result typings
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
