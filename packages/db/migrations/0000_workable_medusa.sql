CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text DEFAULT '$' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "currencies_name_check" CHECK("currencies"."name" <> ''),
	CONSTRAINT "currencies_symbol_check" CHECK("currencies"."symbol" <> '')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `currencies_name_unique` ON `currencies` (`name`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`title` text NOT NULL,
	`start_at` text,
	`end_at` text,
	`description` text,
	`recurrence_rule` text,
	`location_name` text,
	`location_lat` real,
	`location_lon` real,
	`is_external` integer DEFAULT false,
	`external_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "events_title_check" CHECK("events"."title" <> '')
);
--> statement-breakpoint
CREATE TABLE `finance_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`finance_id` integer,
	`project_id` integer NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`currency_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`finance_id`) REFERENCES `finances`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `finances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`task_id` integer,
	`event_id` integer,
	`habit_id` integer,
	`amount` real NOT NULL,
	`currency_id` integer NOT NULL,
	`title` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "finances_title_check" CHECK("finances"."title" <> '')
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`is_strict` integer DEFAULT false,
	`title` text NOT NULL,
	`due_minutes` integer,
	`location_name` text,
	`location_lat` real,
	`location_lon` real,
	`completition_by` integer,
	`count_goal` integer DEFAULT 1,
	`begin_at` text DEFAULT CURRENT_TIMESTAMP,
	`recurrence_rule` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "habits_title_check" CHECK("habits"."title" <> ''),
	CONSTRAINT "habits_due_minutes_check" CHECK("habits"."due_minutes" > 0 OR "habits"."due_minutes" IS NULL),
	CONSTRAINT "habits_completition_check" CHECK("habits"."completition_by" > 0 AND "habits"."completition_by" < 3),
	CONSTRAINT "habits_count_goal_check" CHECK("habits"."count_goal" > 0)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "notes_title_check" CHECK("notes"."title" <> '')
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#FFFFFF' NOT NULL,
	`icon` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "projects_name_check" CHECK("projects"."name" <> '')
);
--> statement-breakpoint
CREATE TABLE `task_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer,
	`start_time` text,
	`end_time` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "valid_date_check" CHECK("task_executions"."start_time" <= "task_executions"."end_time")
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`habit_id` integer,
	`title` text NOT NULL,
	`due_date` text,
	`location_name` text,
	`location_lat` real,
	`location_lon` real,
	`completition_by` integer,
	`count_goal` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "tasks_title_check" CHECK("tasks"."title" <> ''),
	CONSTRAINT "tasks_completition_check" CHECK("tasks"."completition_by" > 0 AND "tasks"."completition_by" < 3),
	CONSTRAINT "tasks_count_goal_check" CHECK("tasks"."count_goal" > 0)
);
