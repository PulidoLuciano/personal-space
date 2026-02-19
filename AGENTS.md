# AGENTS.md - Personal Space Development Guide

This document provides guidelines for AI agents operating in the Personal Space monorepo.

---

## 1. Project Structure

```
personal-space/               # Root monorepo
├── apps/
│   ├── desktop/              # Tauri 2.0 (React + TS)
│   ├── mobile/               # Expo (React Native)
│   └── cli/                  # oclif CLI
├── packages/
│   ├── db/                   # Drizzle ORM + Zod (shared)
│   └── logic/                # Business logic (shared)
├── package.json               # Workspace root
├── turbo.json                 # Turborepo config
└── .gitignore
```

---

## 2. Build & Run Commands

### Root Commands (Turborepo)
```bash
npm run dev           # Start all dev servers
npm run build        # Build all packages/apps
npm run lint         # Lint all packages/apps
```

### Desktop (Tauri)
```bash
cd apps/desktop
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run tauri dev    # Start Tauri desktop app
npm run tauri build # Build desktop executable
```

### Mobile (Expo)
```bash
cd apps/mobile
npm run start        # Start Expo dev server
npm run web          # Run web version
npm run android      # Run on Android
npm run ios          # Run on iOS
```

### CLI (oclif)
```bash
cd apps/cli
npm run dev          # Run CLI in dev mode
npm run build        # Build CLI
npm run lint         # Lint CLI code
npm run test         # Run tests (mocha)
```

### Single Test (CLI)
```bash
cd apps/cli
npm test -- --grep "test name"    # Run specific test
npm test -- test/commands/hello/world.test.ts  # Run specific file
```

---

## 3. Code Style Guidelines

### General Principles
- Use TypeScript for all new code
- Avoid `any` - use proper types or `unknown` when necessary
- Use ESLint and Prettier (enforced in CLI app)
- Run `npm run build` before committing to verify compilation

### Naming Conventions
- **Files**: kebab-case (`user-service.ts`, `my-component.tsx`)
- **Components (React)**: PascalCase (`UserProfile.tsx`)
- **Functions/variables**: camelCase (`getUserData`, `isActive`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix optional (`User`, `UserProps`)

### Imports
```typescript
// External libraries
import { useState } from 'react'
import { drizzle } from 'drizzle-orm'

// Internal packages (use workspace aliases)
import { db } from '@personal-space/db'
import { createTask } from '@personal-space/logic'

// Relative imports for same package
import { User } from './schemas/user'
```

### TypeScript Guidelines
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Enable `strict: true` in tsconfig
- Avoid optional properties (`?`) unless truly optional

### React/React Native
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript generics for reusable components

### Error Handling
- Use try/catch for async operations
- Create custom error classes for domain errors
- Never expose raw errors to users - log and show user-friendly messages
- Use Zod for runtime validation of external data

### Database (Drizzle ORM)
- Define schemas in `packages/db`
- Use migrations for schema changes
- Never expose raw SQL without parameterization
- Use transactions for multi-step operations

---

## 4. Testing Guidelines

- Write tests for business logic in `@personal-space/logic`
- Use descriptive test names: `describe('createTask', () => { it('should...') })`
- CLI tests go in `apps/cli/test/`
- Run tests with `npm test` in respective workspace

---

## 5. Git Conventions

- Use meaningful commit messages
- Create feature branches for new features
- Run `npm run build` and `npm run lint` before committing
- Do not commit secrets or credentials

---

## 6. Dependencies

### Adding New Dependencies
```bash
# Add to specific workspace
npm install package-name --workspace=apps/desktop

# Add to shared package
npm install package-name --workspace=@personal-space/db
```

### Workspace Dependencies
- `@personal-space/db` - Database schemas and Drizzle ORM
- `@personal-space/logic` - Shared business logic
- All apps should depend on these packages, not duplicate logic
