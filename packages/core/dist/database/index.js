export async function createDatabase(db) {
    await createColorsTable(db);
    await createIconsTable(db);
    await createProjectsTable(db);
    await seedColorsTable(db);
    await seedIconsTable(db);
}
async function createColorsTable(db) {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS colors (
      rgb TEXT PRIMARY KEY,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `);
}
async function createIconsTable(db) {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS icons (
      name TEXT PRIMARY KEY,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `);
}
async function createProjectsTable(db) {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color_id TEXT,
      icon_id TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0
    )
  `);
}
async function seedColorsTable(db) {
    const colors = [
        "#1565C0", "#0D47A1", "#1976D2", "#0D47A1", "#1A237E",
        "#388E3C", "#2E7D32", "#4CAF50", "#2E7D32", "#1B5E20",
        "#D32F2F", "#C62828", "#F44336", "#C62828", "#B71C1C",
        "#C2185B", "#AD1457", "#E91E63", "#AD1457", "#880E4F",
        "#F57C00", "#EF6C00", "#FF9800", "#EF6C00", "#E65100",
        "#FF8F00", "#FF6F00", "#FFA000", "#FF6F00", "#E65100",
        "#5D4037", "#4E342E", "#795548", "#4E342E", "#3E2723",
        "#7B1FA2", "#6A1B9A", "#9C27B0", "#6A1B9A", "#4A148C",
    ];
    const now = new Date().toISOString();
    for (const rgb of colors) {
        await db.execute("INSERT OR IGNORE INTO colors (rgb, is_deleted, updated_at) VALUES (?, 0, ?)", [rgb, now]);
    }
}
async function seedIconsTable(db) {
    const icons = [
        "apple", "award", "baby", "backpack", "badge-dollar-sign", "balloon", "beer",
        "bike", "book", "brain", "briefcase-business", "camera", "car", "cat",
        "chart-no-axes-combined", "chef-hat", "chess-knight", "circle",
        "clapperboard", "code-xml", "coffee", "dog", "dumbbell",
        "earth", "fish", "footprints", "gamepad-2", "graduation-cap", "hamburger",
        "headphones", "heart", "languages", "laptop-minimal", "leaf", "library-big",
        "lightbulb", "megaphone", "mic-vocal", "motorbike", "music", "notepad-text",
        "paintbrush", "palette", "paw-print", "pill", "plane", "presentation",
        "puzzle", "sailboat", "scale", "shopping-cart", "shovel", "sprout", "star",
        "sun", "syringe", "test-tube-diagonal", "trophy", "truck", "wrench"
    ];
    const now = new Date().toISOString();
    for (const name of icons) {
        await db.execute("INSERT OR IGNORE INTO icons (name, is_deleted, updated_at) VALUES (?, 0, ?)", [name, now]);
    }
}
//# sourceMappingURL=index.js.map