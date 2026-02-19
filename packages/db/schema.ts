import {
  sqliteTable,
  integer,
  text,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Helpers ---
const timestamps = {
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
};

// --- Tables ---

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    color: text("color").default("#FFFFFF").notNull(),
    icon: text("icon"),
    ...timestamps,
  },
  (table) => [check("projects_name_check", sql`${table.name} <> ''`)],
);

export const currencies = sqliteTable(
  "currencies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    symbol: text("symbol").default("$").notNull(),
    ...timestamps,
  },
  (table) => [
    check("currencies_name_check", sql`${table.name} <> ''`),
    check("currencies_symbol_check", sql`${table.symbol} <> ''`),
  ],
);

export const habits = sqliteTable(
  "habits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    isStrict: integer("is_strict", { mode: "boolean" }).default(false),
    title: text("title").notNull(),
    dueMinutes: integer("due_minutes"),
    locationName: text("location_name"),
    locationLat: real("location_lat"),
    locationLon: real("location_lon"),
    completitionBy: integer("completition_by"),
    countGoal: integer("count_goal").default(1),
    beginAt: text("begin_at").default(sql`CURRENT_TIMESTAMP`),
    recurrenceRule: text("recurrence_rule").default("").notNull(),
    ...timestamps,
  },
  (table) => [
    check("habits_title_check", sql`${table.title} <> ''`),
    check(
      "habits_due_minutes_check",
      sql`${table.dueMinutes} > 0 OR ${table.dueMinutes} IS NULL`,
    ),
    check(
      "habits_completition_check",
      sql`${table.completitionBy} > 0 AND ${table.completitionBy} < 3`,
    ),
    check("habits_count_goal_check", sql`${table.countGoal} > 0`),
  ],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    habitId: integer("habit_id").references(() => habits.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    dueDate: text("due_date"), // DATETIME
    locationName: text("location_name"),
    locationLat: real("location_lat"),
    locationLon: real("location_lon"),
    completitionBy: integer("completition_by"),
    countGoal: integer("count_goal").default(1),
    ...timestamps,
  },
  (table) => [
    check("tasks_title_check", sql`${table.title} <> ''`),
    check(
      "tasks_completition_check",
      sql`${table.completitionBy} > 0 AND ${table.completitionBy} < 3`,
    ),
    check("tasks_count_goal_check", sql`${table.countGoal} > 0`),
  ],
);

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    startAt: text("start_at"), // DATETIME
    endAt: text("end_at"), // DATETIME
    description: text("description"),
    recurrenceRule: text("recurrence_rule"),
    locationName: text("location_name"),
    locationLat: real("location_lat"),
    locationLon: real("location_lon"),
    isExternal: integer("is_external", { mode: "boolean" }).default(false),
    externalId: text("external_id"),
    ...timestamps,
  },
  (table) => [check("events_title_check", sql`${table.title} <> ''`)],
);

export const finances = sqliteTable(
  "finances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    taskId: integer("task_id").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    habitId: integer("habit_id").references(() => habits.id, {
      onDelete: "cascade",
    }),
    amount: real("amount").notNull(),
    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id, { onDelete: "no action" }),
    title: text("title").notNull(),
    ...timestamps,
  },
  (table) => [check("finances_title_check", sql`${table.title} <> ''`)],
);

export const taskExecutions = sqliteTable(
  "task_executions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    taskId: integer("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    startTime: text("start_time"), // DATETIME
    endTime: text("end_time"), // DATETIME
    ...timestamps,
  },
  (table) => [
    check("valid_date_check", sql`${table.startTime} <= ${table.endTime}`),
  ],
);

export const financeExecutions = sqliteTable("finance_executions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  financeId: integer("finance_id").references(() => finances.id, {
    onDelete: "set null",
  }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: text("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  amount: real("amount").default(0).notNull(),
  currencyId: integer("currency_id")
    .notNull()
    .references(() => currencies.id, { onDelete: "no action" }),
  ...timestamps,
});

export const notes = sqliteTable(
  "notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
    ...timestamps,
  },
  (table) => [check("notes_title_check", sql`${table.title} <> ''`)],
);
