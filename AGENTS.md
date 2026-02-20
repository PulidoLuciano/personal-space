# AGENTS.md - Personal Space Monorepo

## Overview

Personal Space is a Turborepo npm workspace monorepo with three interfaces sharing the same SQLite database:
- **Mobile** (`apps/mobile`): Expo (React Native)
- **Desktop** (`apps/desktop`): Tauri + React + Vite
- **CLI** (`apps/cli`): oclif
- **Shared** (`packages/db`): Drizzle ORM schemas
- **Logic** (`packages/logic`): Shared business logic

---

## Build / Lint / Test Commands

### Root Commands (Turborepo)
```bash
# Run all apps in development
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint
```

### Mobile (Expo)
```bash
cd apps/mobile

# Development
npm run dev          # Start Expo
npm run start        # Same as dev
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web

# Linting
npm run lint         # Run ESLint
```

### Desktop (Tauri)
```bash
cd apps/desktop

# Development
npm run dev          # Vite dev server (browser only, no Tauri APIs)
npm run dev:tauri    # Full Tauri desktop app

# Building
npm run build        # Build Vite frontend
npm run build:tauri  # Build Tauri desktop app
```

### CLI (oclif)
```bash
cd apps/cli

# Development
npm run dev          # Run CLI in dev mode

# Build
npm run build        # Compile TypeScript to JavaScript

# Run CLI
./bin/run.js         # Run compiled CLI
personal-space       # After npm run build
```

### Database (packages/db)
```bash
cd packages/db

# Generate migrations from schema
npx drizzle-kit generate

# Check package.json for test scripts (none configured)
```

---

## Code Style Guidelines

### General
- Use TypeScript in all new code
- Avoid default exports; use named exports
- Use absolute imports via workspace aliases (`@personal-space/db`, `@personal-space/logic`)

### Imports
```typescript
// Order: external → workspace → relative
import { useState, useEffect } from "react";
import { initDatabase, getDatabase } from "@/lib/db";
import { projects, habits } from "@personal-space/db/schema";
import type { PersonalSpaceDB } from "@personal-space/db";

// Relative imports for local files
import { MyComponent } from "./components/MyComponent";
```

### Naming Conventions
- **Files**: kebab-case (`my-component.tsx`, `db-utils.ts`)
- **Components**: PascalCase (`MyComponent.tsx`)
- **Functions/variables**: camelCase (`initDatabase`, `dbReady`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Database tables**: snake_case in SQL, camelCase in TypeScript

### TypeScript
- Always type function parameters and return values
- Use `interface` for public APIs, `type` for unions/intersections
- Prefer explicit types over `any`

```typescript
// Good
interface User {
  id: number;
  name: string;
}

function getUser(id: number): Promise<User | null> {
  // ...
}

// Avoid
function getUser(id: any): any { /* ... */ }
```

### Error Handling
- Use try/catch for async operations
- Log errors with context using `[Component] message` format
- Throw descriptive errors, not generic ones

```typescript
// Good
try {
  await initDatabase();
} catch (err) {
  console.error("[DB] Error initializing database:", err);
  throw new Error("Failed to initialize database");
}

// For expected errors
if (!db) {
  throw new Error("Database not initialized. Call initDatabase() first.");
}
```

### Database (Drizzle ORM)
- Schema definitions go in `packages/db/schema.ts`
- Exports from `packages/db/index.ts`
- Use migrations: `npx drizzle-kit generate`
- Seed data in `packages/db/seed.ts`

```typescript
// Table definition
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // ...
});
```

### React Components
- Use functional components with hooks
- Extract business logic to custom hooks or packages
- Initialize database in `_layout.tsx` or App root

```typescript
// Good pattern
useEffect(() => {
  initDatabase()
    .then(() => setDbReady(true))
    .catch((err) => console.error("[App] DB error:", err));
}, []);
```

### ESLint / Prettier
- Mobile uses: `eslint-config-expo`
- Desktop uses: Vite default + React plugin
- Run `npm run lint` before committing

---

## Database Setup

### Migration Workflow
1. Modify `packages/db/schema.ts`
2. Run `npx drizzle-kit generate` in `packages/db`
3. Copy migration to `packages/db/migrations.ts` (bundled format for mobile/desktop)
4. Commit both files

### Database Path
- **Tauri/Desktop**: `~/.config/com.luciano-pulido.desktop/personal-space.db`
- **CLI**: Same path as Tauri
- **Mobile**: App sandbox (handled by expo-sqlite)

---

## Important Files

- `packages/db/schema.ts` - Database schema definition
- `packages/db/index.ts` - Exports and types
- `packages/db/migrations.ts` - Bundled migrations for mobile/desktop
- `packages/db/seed.ts` - Seed data
- `apps/mobile/lib/db.ts` - Mobile database initialization
- `apps/desktop/src/lib/db.ts` - Desktop database initialization
- `apps/desktop/src-tauri/capabilities/default.json` - Tauri permissions

---

## Common Tasks

### Add a new table
1. Add table definition to `packages/db/schema.ts`
2. Export from `packages/db/index.ts`
3. Generate migrations: `cd packages/db && npx drizzle-kit generate`
4. Update `packages/db/migrations.ts` with new migration
5. Rebuild apps

### Add a new package dependency
```bash
# Add to specific app
cd apps/mobile && npm install package-name

# Add to shared package
cd packages/db && npm install package-name
```

### Run a single test (if tests exist)
```bash
# For Vitest
npx vitest run --test-name-pattern "test name"

# For Jest
npx jest --testNamePattern="test name"
```
