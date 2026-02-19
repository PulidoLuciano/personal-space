import { ExtractTablesWithRelations } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

export * from "./schema";
export * from "./seed"; // <--- Add this line

export type PersonalSpaceDB = BaseSQLiteDatabase<
  "sync" | "async",
  void,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
