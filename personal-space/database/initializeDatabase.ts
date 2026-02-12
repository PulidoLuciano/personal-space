import * as SQLite from "expo-sqlite";

export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("personal_space_db");

  // Habilitar claves foráneas
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await db.withTransactionAsync(async () => {
    // 1. PROJECTS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL DEFAULT "#FFFFFF",
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. TASK STATES
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    // Insertar estados por defecto si no existen
    await db.execAsync(`
      INSERT OR IGNORE INTO task_states (id, name) VALUES 
      (1, 'Pending'), (2, 'Skipped'), (3, 'Complete');
    `);

    // 3. TASKS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        state_id INTEGER NOT NULL DEFAULT 1,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        recurrence_rule TEXT,
        location_name TEXT,
        location_lat REAL,
        location_lon REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (state_id) REFERENCES task_states (id)
      );
    `);

    // 4. EVENTS
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        title TEXT NOT NULL,
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
        is_income BOOLEAN NOT NULL DEFAULT 0,
        amount REAL NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL
      );
    `);

    // 6. EXECUTIONS (Time Tracking)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT CHECK(type IN ('manual', 'pomodoro', 'stopwatch')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      );
    `);

    // 7. NOTES
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
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
