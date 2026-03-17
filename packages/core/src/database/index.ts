export interface DBClient {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | undefined>;
  execute(
    sql: string,
    params?: any[],
  ): Promise<{ insertId?: number | bigint; changes: number }>;
}

export async function createDatabase(db: DBClient) {
  await createColorsTable(db);
  await createIconsTable(db);
  await createListsTable(db);
  await createSectionsTable(db);
  await createCurrenciesTable(db);
  await createTasksTable(db);
  await createTaskExecutionsTable(db);
  await createTaskExecutionsTable(db);
  await createUpdateTriggers(db);
  await seedColorsTable(db);
  await seedIconsTable(db);
  await seedCurrenciesTable(db);
  await seedListTable(db);
  await seedSectionTable(db);
}

async function createColorsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS colors (
      rgb TEXT PRIMARY KEY,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function createIconsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS icons (
      name TEXT PRIMARY KEY,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function createListsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color_id TEXT NOT NULL,
      icon_id TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0,
      show_completed INTEGER NOT NULL DEFAULT 1,
      mutable INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0
      FOREIGN KEY (color_id) REFERENCES colors(rgb),
      FOREIGN KEY (icon_id) REFERENCES icons(name),
    )
  `);
}

async function createSectionsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      list_id TEXT NOT NULL,
      mutable INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0
      FOREIGN KEY (list_id) REFERENCES lists(id),
    )
  `);
}

async function createCurrenciesTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS currencies (
      name TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0
    )
  `);
}

async function createFinancesTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS finances (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      project_id TEXT NOT NULL,
      currency_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(name)
    )
  `);
}

async function createFinanceExecutionsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS finance_executions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      finance_id TEXT NOT NULL,
      currency_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (finance_id) REFERENCES finances(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(name)
    )
  `);
}

async function createTasksTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      body TEXT,
      location TEXT,
      due_rule TEXT,
      type TEXT CHECK(type IN ('by time', 'by executions', 'note')) NOT NULL DEFAULT 'by executions'
      objective INTEGER NOT NULL DEFAULT 1,
      recurrency TEXT,
      begin_date TEXT,
      section_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (section_id) REFERENCES sections(id)
    )
  `);
}

async function createTaskExecutionsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_executions (
      id TEXT PRIMARY KEY,
      ocurrence_date TEXT,
      start_time TEXT NOT NULL DEFAULT (datetime('now')),
      end_time TEXT,
      task_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);
}

async function createTaskExceptionsTable(db: DBClient) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_exceptions (
      id TEXT PRIMARY KEY,
      ocurrence_date TEXT,
      rescheduled_due TEXT,
      override_description TEXT,
      override_location TEXT,
      override_type TEXT CHECK(override_type IN ('by time', 'by executions', 'note')),
      override_objective INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);
}

async function seedColorsTable(db: DBClient) {
  const colors = [
    "#1565C0",
    "#0D47A1",
    "#1976D2",
    "#0D47A1",
    "#1A237E",
    "#388E3C",
    "#2E7D32",
    "#4CAF50",
    "#2E7D32",
    "#1B5E20",
    "#D32F2F",
    "#C62828",
    "#F44336",
    "#C62828",
    "#B71C1C",
    "#C2185B",
    "#AD1457",
    "#E91E63",
    "#AD1457",
    "#880E4F",
    "#F57C00",
    "#EF6C00",
    "#FF9800",
    "#EF6C00",
    "#E65100",
    "#FF8F00",
    "#FF6F00",
    "#FFA000",
    "#FF6F00",
    "#E65100",
    "#5D4037",
    "#4E342E",
    "#795548",
    "#4E342E",
    "#3E2723",
    "#7B1FA2",
    "#6A1B9A",
    "#9C27B0",
    "#6A1B9A",
    "#4A148C",
    "#00000000",
  ];
  const now = new Date().toISOString();
  for (const rgb of colors) {
    await db.execute(
      "INSERT OR IGNORE INTO colors (rgb, is_deleted, updated_at) VALUES (?, 0, ?)",
      [rgb, now],
    );
  }
}

async function seedIconsTable(db: DBClient) {
  const icons = [
    "apple",
    "award",
    "baby",
    "backpack",
    "badge-dollar-sign",
    "balloon",
    "beer",
    "bike",
    "book",
    "brain",
    "briefcase-business",
    "camera",
    "car",
    "cat",
    "chart-no-axes-combined",
    "chef-hat",
    "chess-knight",
    "circle",
    "clapperboard",
    "code-xml",
    "coffee",
    "dog",
    "dumbbell",
    "earth",
    "fish",
    "footprints",
    "gamepad-2",
    "graduation-cap",
    "hamburger",
    "headphones",
    "heart",
    "languages",
    "laptop-minimal",
    "leaf",
    "library-big",
    "lightbulb",
    "megaphone",
    "mic-vocal",
    "motorbike",
    "music",
    "notepad-text",
    "paintbrush",
    "palette",
    "paw-print",
    "pill",
    "plane",
    "presentation",
    "puzzle",
    "sailboat",
    "scale",
    "shopping-cart",
    "shovel",
    "sprout",
    "star",
    "sun",
    "syringe",
    "test-tube-diagonal",
    "trophy",
    "truck",
    "wrench",
    "inbox",
  ];
  const now = new Date().toISOString();
  for (const name of icons) {
    await db.execute(
      "INSERT OR IGNORE INTO icons (name, is_deleted, updated_at) VALUES (?, 0, ?)",
      [name, now],
    );
  }
}

async function seedCurrenciesTable(db: DBClient) {
  const currencies = [
    { name: "USD", symbol: "$" },
    { name: "EUR", symbol: "€" },
    { name: "COP", symbol: "$" },
    { name: "MXN", symbol: "$" },
    { name: "GBP", symbol: "£" },
    { name: "JPY", symbol: "¥" },
    { name: "ARS", symbol: "$" },
  ];
  const now = new Date().toISOString();
  for (const { name, symbol } of currencies) {
    await db.execute(
      "INSERT OR IGNORE INTO currencies (name, symbol, is_deleted, updated_at) VALUES (?, ?, 0, ?)",
      [name, symbol, now],
    );
  }
}

async function seedListTable(db: DBClient) {
  await db.execute(
    "INSERT OR IGNORE INTO lists (id, name, mutable, icon_id, color_id) VALUES (0, Inbox, 0, inbox, #00000000)",
  );
}

async function seedSectionTable(db: DBClient) {
  await db.execute(
    "INSERT OR IGNORE INTO sections (id, name, mutable, list_id) VALUES (0, Not sectioned, 0, 0)",
  );
}

async function createUpdateTriggers(db: DBClient) {
  const tables: { name: string }[] = await db.query(
    "SELECT name FROM sqlit_master WHERE type='table' AND name NOT LIKE sqlite_%",
  );
  tables.forEach(async (row) => {
    const tableName = row.name;
    const sqlCreateTrigger = `
      CREATE TRIGGER IF NOT EXISTS actualizar_updated_at_${tableName}
      AFTER UPDATE ON ${tableName}
      FOR EACH ROW
      WHEN NEW.updated_at = OLD.updated_at
      BEGIN
          UPDATE ${tableName} 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = OLD.id;
      END;
    `;
    await db.execute(sqlCreateTrigger);
  });
}
