import { ExtractTablesWithRelations } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

export * from "./schema";

// This is the universal type you will use in `@personal-space/logic`
export type PersonalSpaceDB = BaseSQLiteDatabase<
  "sync" | "async",
  void,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
