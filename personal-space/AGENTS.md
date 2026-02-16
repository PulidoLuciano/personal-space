# AGENTS.md - Developer Guidelines for Personal Space

## Project Overview

Personal Space is an Expo/React Native mobile app with TypeScript. Uses expo-router for routing, SQLite for local storage, and Clean Architecture (Entities, Use Cases, Repositories).

## Commands

```bash
npm start         # Start Expo (QR code for mobile)
npm run android   # Run on Android emulator
npm run ios       # Run on iOS simulator
npm run web       # Run in browser
npm run lint      # Run ESLint with expo config
npm install       # Install dependencies
```

Note: No test framework configured yet.

## Code Style

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Path aliases: `@/*` maps to project root
- Example: `import { ProjectEntity } from "@/core/entities/ProjectEntity";`

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `ProjectEntity`, `CreateProjectUseCase` |
| Interfaces | PascalCase (no I prefix) | `QueryCriteria<T>` |
| Types | PascalCase | `FilterOperator` |
| Functions/variables | camelCase | `getProjects` |
| Constants (values) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files (components) | kebab-case | `project-card.tsx` |
| Files (classes) | PascalCase | `ProjectEntity.ts` |
| Database columns | snake_case | `created_at`, `project_id` |

### Imports Order
```typescript
// 1. React/external
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

// 2. Internal @/ imports
import { useTheme } from "@/hooks/useTheme";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

// 3. Relative (avoid)
```

### Architecture
```
core/
  entities/      # Business entities with validation
  useCases/     # Business logic
database/
  repositories/ # SQLite data access
app/            # Expo Router pages
components/     # Reusable UI components
hooks/          # Custom React hooks
constants/      # App constants (themes, i18n)
utils/          # Utility functions
```

### Entity Pattern
```typescript
export interface ProjectProps {
  id?: number;
  name: string;
  color?: string;
}

export class ProjectEntity {
  public readonly id?: number;
  public readonly name: string;

  constructor(props: ProjectProps) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres.");
    }
    this.name = props.name.trim();
  }

  static fromDatabase(row: any): ProjectEntity {
    return new ProjectEntity({ id: row.id, name: row.name });
  }
}
```

### Use Case Pattern
```typescript
export class CreateProjectUseCase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(props: { name: string }): Promise<number> {
    const project = new ProjectEntity(props);
    return await this.projectRepo.create({ ...project });
  }
}
```

### Repository Pattern
Extend `BaseRepository<T>` which provides: `getAll()`, `getById()`, `find()`, `create()`, `update()`, `delete()`, `count()`.

### Context Providers
```typescript
const ExampleContext = createContext<ExampleContextType | null>(null);

export const ExampleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ExampleContext.Provider value={...}>{children}</ExampleContext.Provider>;
};

export const useExample = () => {
  const context = useContext(ExampleContext);
  if (!context) throw new Error("useExample must be used within ExampleProvider");
  return context;
};
```

### Event System
```typescript
// utils/events/TaskEvents.ts
import { EventEmitter } from "eventemitter3";
export const taskEvents = new EventEmitter();
export const TASK_CHANGED = "taskChanged";

// Emit after changes:
taskEvents.emit(TASK_CHANGED, { id: 123 });

// Listen in hooks/components:
useEffect(() => {
  const handler = () => { /* reload */ };
  taskEvents.on(TASK_CHANGED, handler);
  return () => taskEvents.off(TASK_CHANGED, handler);
}, []);
```

### Error Handling
- Throw `Error` with Spanish messages for user-facing errors
- Use try/catch in async operations
- Show alerts in UI components

### UI/Styling
- React Native built-in styling
- Theme context: `components/providers/ThemeContext.tsx`
- Use `StyleSheet.create()` - avoid inline styles

### ESLint
- Uses `eslint-config-expo` (flat config format)
- Run `npm run lint` before commits

## Database

- SQLite with expo-sqlite async API (`openDatabaseAsync`, `execAsync`)
- Wrap multiple operations in `withTransactionAsync`
- All tables have `created_at`, `updated_at` timestamps
- Foreign keys use snake_case (e.g., `project_id`)

### Tables
- `projects`, `currencies`, `habits`, `tasks`, `events`, `finances`
- `task_executions`, `finance_executions`, `notes`

## Important Notes

- Mobile app (Expo), not web
- Spanish for user-facing strings
- i18next for localization (English + Spanish)
- Stack navigation for detail screens, Tabs for main nav
- Wrap Stack screens in parent `_layout.tsx` for proper hierarchy
