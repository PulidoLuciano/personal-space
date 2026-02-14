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

### Architecture Pattern (Clean Architecture)

```
core/
  entities/      # Business entities with validation
  useCases/      # Business logic, orchestrate repositories
database/
  repositories/  # Data access layer (SQLite)
app/             # Expo Router pages
components/      # Reusable UI components
hooks/           # Custom React hooks
constants/       # App constants (themes, localization)
utils/           # Utility functions
```

### Entity Pattern
Entities validate input in their constructor and throw errors with user-friendly Spanish messages:

```typescript
export class ProjectEntity {
  public readonly id?: number;
  public readonly name: string;
  
  constructor(props: { id?: number; name: string }) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("El nombre del proyecto debe tener al menos 3 caracteres.");
    }
    this.name = props.name.trim();
  }
  
  static fromDatabase(row: any): ProjectEntity {
    return new ProjectEntity({...row});
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

### Imports
- Use absolute imports with `@/` prefix
- Group imports: React/external → internal (@/) → relative
- Avoid barrel files unless necessary

### Error Handling
- Throw `Error` with Spanish messages for user-facing errors
- Use try/catch in async operations
- Repository methods return `Promise<T>` or `Promise<void>`

### UI/Styling
- Components use React Native built-in styling
- Theme context in `components/providers/ThemeContext.tsx`
- Use constants from `constants/themes.ts`

### ESLint Configuration
- Uses `eslint-config-expo` (flat config format)
- Check `eslint.config.js` for full rules
- Run `npm run lint` before committing

## File Structure Summary

```
personal-space/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   └── modal/            # Modal screens
├── components/            # Reusable components
│   ├── providers/        # React Context providers
│   └── ui/               # Base UI components
├── constants/            # App constants
│   └── localization/     # i18n translations
├── core/                 # Business logic
│   ├── entities/         # Domain entities
│   └── useCases/         # Business use cases
├── database/             # Data layer
│   └── repositories/     # SQLite repositories
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## Important Notes

- This is a **mobile app** (Expo), not a web app
- No unit tests currently configured
- Spanish is used for user-facing strings in error messages
- Database uses expo-sqlite for local storage
- Localization uses i18next with English and Spanish
