import * as SQLite from "expo-sqlite";

const DB_NAME = "personal_space_db";

export const deleteDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.closeAsync();
    // Wait a bit to ensure the database is fully closed
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (e) {
    // Database might not exist, ignore error
  }
  try {
    await SQLite.deleteDatabaseAsync(DB_NAME);
  } catch (e) {
    // Ignore if already deleted
  }
};

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Habilitar claves foráneas
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await db.withTransactionAsync(async () => {
    // 1. PROJECTS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(name <> ''),
        color TEXT NOT NULL DEFAULT "#FFFFFF",
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS currencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE CHECK(name <> ''),
        symbol TEXT NOT NULL DEFAULT '$' CHECK(symbol <> ''),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Precargar monedas
    await db.execAsync(`
      INSERT OR IGNORE INTO currencies (name, symbol) VALUES
        ('Peso Argentino', 'ARS$'),
        ('Dólar Estadounidense', 'US$'),
        ('Euro', '€'),
        ('Real Brasileño', 'R$'),
        ('Peso Mexicano', 'MX$'),
        ('Peso Chileno', 'CLP$'),
        ('Peso Colombiano', 'COP$'),
        ('Libra Esterlina', '£'),
        ('Yen Japonés', '¥'),
        ('Yuan Chino', '¥');
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        is_strict BOOLEAN DEFAULT FALSE,
        title TEXT NOT NULL CHECK(title <> ''),
        due_minutes INTEGER CHECK(due_minutes > 0 OR due_minutes IS NULL),
        location_name TEXT,
        location_lat REAL,
        location_lon REAL,
        completition_by INTEGER CHECK(completition_by > 0 AND completition_by < 3),
        count_goal INTEGER CHECK(count_goal > 0) DEFAULT 1,
        begin_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        recurrence_rule TEXT NOT NULL DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );
    `);

    // 3. TASKS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        habit_id INTEGER,
        title TEXT NOT NULL CHECK(title <> ''),
        due_date DATETIME,
        location_name TEXT,
        location_lat REAL,
        location_lon REAL,
        completition_by INTEGER CHECK(completition_by > 0 AND completition_by < 3),
        count_goal INTEGER CHECK(count_goal > 0) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
      );
    `);

    // 4. EVENTS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        title TEXT NOT NULL CHECK(title <> ''),
        start_at DATETIME,
        end_at DATETIME,
        description TEXT,
        recurrence_rule TEXT,
        location_name TEXT,
        location_lat REAL,
        location_lon REAL,
        is_external BOOLEAN DEFAULT 0,
        external_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
      );
    `);

    // 5. FINANCES
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS finances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        task_id INTEGER,
        event_id INTEGER,
        habit_id INTEGER,
        amount REAL NOT NULL,
        currency_id INTEGER NOT NULL,
        title TEXT NOT NULL CHECK(title <> ''),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
        FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE NO ACTION
      );
    `);

    // 6. EXECUTIONS (Time Tracking)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        start_time DATETIME,
        end_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
        CONSTRAINT valid_date CHECK (start_time <= end_time)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS finance_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finance_id INTEGER,
        project_id INTEGER NOT NULL,
        date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount REAL NOT NULL DEFAULT 0,
        currency_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (finance_id) REFERENCES finances (id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE NO ACTION
      );
    `);

    // 7. NOTES
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL CHECK(title <> ''),
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );
    `);

    // TRIGGERS PARA UPDATED_AT
    // (Ejemplo para la tabla tasks, repetir para projects, events, finances, notes)
    const tablesToTrigger = [
      "projects",
      "tasks",
      "events",
      "finances",
      "notes",
    ];
    for (const table of tablesToTrigger) {
      await db.execAsync(`
        CREATE TRIGGER IF NOT EXISTS trg_updated_at_${table}
        AFTER UPDATE ON ${table}
        BEGIN
          UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
      `);
    }
  });

  return db;
};
