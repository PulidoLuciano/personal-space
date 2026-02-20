import { ExtractTablesWithRelations } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

export * from "./schema";
export * from "./seed";
export * from "./migrations";
export * from "./zod";

export type PersonalSpaceDB = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
