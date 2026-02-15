# AGENTS.md - Developer Guidelines for Personal Space

## Project Overview

Personal Space is an Expo/React Native mobile application with TypeScript. It uses expo-router for file-based routing, SQLite for local database, and follows a Clean Architecture pattern with Use Cases, Entities, and Repositories.

## Build & Development Commands

### Running the App
```bash
npm start          # Start Expo (shows QR code for mobile)
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator  
npm run web        # Run in browser
```

### Linting & Type Checking
```bash
npm run lint       # Run ESLint with expo config
```

There are no test scripts defined in this project.

### Project Setup
```bash
npm install        # Install dependencies
npm run reset-project  # Reset to fresh template
```

## Code Style Guidelines

### TypeScript Configuration
- Strict mode is enabled in `tsconfig.json`
- Use path aliases: `@/*` maps to project root
- Example: `import { ProjectEntity } from "@/core/entities/ProjectEntity";`

### Naming Conventions
- **Classes**: PascalCase (e.g., `ProjectEntity`, `CreateProjectUseCase`)
- **Interfaces**: PascalCase with optional "I" prefix avoided (e.g., `QueryCriteria<T>`)
- **Types**: PascalCase (e.g., `FilterOperator`)
- **Functions/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE for values, camelCase for object keys
- **Files**: kebab-case for components, PascalCase for classes
- **Database columns**: snake_case (e.g., `created_at`, `project_id`)

### Imports Order
```typescript
// 1. React/external imports
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

// 2. Internal @/ imports
import { useTheme } from "@/hooks/useTheme";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

// 3. Relative imports (avoid unless necessary)
```

### Architecture Pattern (Clean Architecture)

```
core/
  entities/      # Business entities with validation
  useCases/     # Business logic, orchestrate repositories
database/
  repositories/ # Data access layer (SQLite)
app/            # Expo Router pages
components/     # Reusable UI components
hooks/          # Custom React hooks
constants/      # App constants (themes, localization)
utils/          # Utility functions
```

### Entity Pattern
Entities validate input in their constructor and throw errors with user-friendly Spanish messages:

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
      throw new Error("El nombre del proyecto debe tener al menos 3 caracteres.");
    }
    this.name = props.name.trim();
  }
  
  static fromDatabase(row: any): ProjectEntity {
    return new ProjectEntity({
      id: row.id,
      name: row.name,
    });
  }
}
```

### Use Case Pattern
Use cases receive repositories via constructor injection:

```typescript
export class CreateProjectUseCase {
  constructor(private projectRepo: ProjectRepository) {}
  
  async execute(props: { name: string }): Promise<number> {
    const project = new ProjectEntity(props);
    return await this.projectRepo.create({...});
  }
}
```

### Repository Pattern
Extend `BaseRepository<T>` for database operations. The base class provides:
- `getAll()`, `getById()`, `find()`, `paginate()`
- `create()`, `update()`, `delete()`, `count()`

### React Components
- Use functional components with hooks
- Put custom hooks in `hooks/` directory
- UI components go in `components/ui/`
- Feature components in `components/[feature]/`
- Use Context providers in `components/providers/`
- Screen components in `app/` directories

### Context Providers Pattern
```typescript
// components/providers/ExampleContext.tsx
const ExampleContext = createContext<ExampleContextType | null>(null);

export const ExampleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... provider logic
  return (
    <ExampleContext.Provider value={...}>
      {children}
    </ExampleContext.Provider>
  );
};

export const useExample = () => {
  const context = useContext(ExampleContext);
  if (!context) {
    throw new Error("useExample must be used within ExampleProvider");
  }
  return context;
};
```

### Event System Pattern
Use event emitters for cross-component communication (similar to projects/notifications):

```typescript
// utils/events/ExampleEvents.ts
import { EventEmitter } from "eventemitter3";
export const exampleEvents = new EventEmitter();
export const EXAMPLE_CHANGED = "exampleChanged";

// In hooks or components:
import { exampleEvents, EXAMPLE_CHANGED } from "@/utils/events/ExampleEvents";

// Emit event after data changes:
exampleEvents.emit(EXAMPLE_CHANGED, { id: 123 });

// Listen for events:
useEffect(() => {
  const handleChanged = () => { /* reload data */ };
  exampleEvents.on(EXAMPLE_CHANGED, handleChanged);
  return () => exampleEvents.off(EXAMPLE_CHANGED, handleChanged);
}, [...]);
```

### Error Handling
- Throw `Error` with Spanish messages for user-facing errors
- Use try/catch in async operations
- Repository methods return `Promise<T>` or `Promise<void>`
- Show user-friendly alerts in UI components

### UI/Styling
- Components use React Native built-in styling
- Theme context in `components/providers/ThemeContext.tsx`
- Use constants from `constants/themes.ts`
- Avoid inline styles - use StyleSheet.create()

### ESLint Configuration
- Uses `eslint-config-expo` (flat config format)
- Check `eslint.config.js` for full rules
- Run `npm run lint` before committing

## Database Schema

### Tables (SQLite)
- `projects`: id, name, color, icon, created_at, updated_at
- `currencies`: id, name, symbol, created_at, updated_at
- `habits`: id, project_id, is_strict, title, due_minutes, location_*, completition_by, count_goal, begin_at, created_at, updated_at
- `tasks`: id, project_id, habit_id, title, due_date, location_*, completition_by, count_goal, created_at, updated_at
- `events`: id, project_id, title, start_at, end_at, description, recurrence_rule, location_*, is_external, external_id, created_at, updated_at
- `finances`: id, project_id, task_id, event_id, habit_id, amount, currency_id, title, created_at, updated_at
- `task_executions`: id, task_id, start_time, end_time, created_at, updated_at
- `finance_executions`: id, finance_id, date, amount, currency_id, created_at, updated_at
- `notes`: id, project_id, title, content, created_at, updated_at

### Key Conventions
- All tables have `created_at` and `updated_at` timestamps
- Foreign keys use snake_case (e.g., `project_id`)
- Use `expo-sqlite` with async API (`openDatabaseAsync`, `execAsync`, etc.)
- Always wrap multiple operations in `withTransactionAsync`

## File Structure Summary

```
personal-space/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── [projectId]/       # Project detail screens (tabs + stack)
│   └── modal/             # Modal screens
├── components/
│   ├── providers/         # React Context providers
│   ├── ui/                # Base UI components
│   └── [feature]/         # Feature-specific components
├── constants/
│   └── localization/      # i18n translations
├── core/
│   ├── entities/          # Domain entities
│   └── useCases/         # Business use cases
├── database/              # Data layer
│   ├── initializeDatabase.ts
│   └── repositories/     # SQLite repositories
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions
    └── events/            # Event emitters
```

## Important Notes

- This is a **mobile app** (Expo), not a web app
- No unit tests currently configured
- Spanish is used for user-facing strings in error messages
- Database uses expo-sqlite for local storage
- Localization uses i18next with English and Spanish
- Use Stack navigation for detail screens, Tabs for main navigation
- Wrap Stack screens in parent directory _layout.tsx for proper navigation hierarchy
