# Agents Documentation

This file provides guidelines for agents operating in the personal-space repository.

## Repository Structure

```
personal-space/
├── apps/
│   └── personal-space-mobile/   # Expo mobile app (main app)
├── packages/
│   └── core/                   # personal-space-core package (business logic)
├── documentation/             # Project documentation
└── assets/                    # Static assets
```

## Build, Lint, and Test Commands

### Mobile App (personal-space-mobile)

```bash
# Development
npm run start        # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web

# Linting
npm run lint        # Run ESLint (uses expo lint)

# Build
npx expo export      # Export for production
```

### Core Package (packages/core)

```bash
# Development
cd packages/core
npm run test        # Run tests in watch mode
npm run test:run   # Run tests once
npm run build      # TypeScript build

# Running a single test
cd packages/core
npx vitest run test/services/tasks.test.ts     # Run specific test file
npx vitest run --testNamePattern="createTask"  # Run tests matching pattern
```

## Code Style Guidelines

### General Principles

- Use strict TypeScript (strict mode enabled in tsconfig.json)
- Prefer functional components and hooks
- Use early returns for error/loading states
- Constants should be in dedicated files (e.g., `constants/theme.ts`)

### Imports

- Use path aliases: `@/` maps to project root
- Group imports: React/Native first, then third-party, then local
- Example: `import { ThemedText } from "@/components/themed-text";`

### Naming Conventions

- **Files**: PascalCase for components (`TaskItem.tsx`), camelCase for utilities
- **Components**: PascalCase (`export function TaskItem()`)
- **Interfaces**: PascalCase with `Props` suffix for component props (`TaskItemProps`)
- **Hooks**: camelCase starting with `use` (`useColorScheme`)
- **Constants**: UPPER_SNAKE_CASE for values, camelCase for objects

### Types

- Use explicit return types for functions
- Use `interface` for public APIs, `type` for unions/intersections
- Nullable values should use `null` explicitly, not `undefined`
- Example: `dueDate?: Date | null` (not `Date | undefined`)

### Error Handling

- Use try-catch for async operations
- Log errors with `console.error()` before alerting users
- Show user-friendly errors via `Alert.alert("Error", "User message")`
- Handle loading and error states explicitly in components

### Styling

- Use `StyleSheet.create()` for React Native styles
- Colors: Use hex codes (`#0a7ea4`) or rgba for transparency
- Spacing: Use consistent values (8, 12, 16, etc.)
- Use `StyleSheet.flatten()` or inline styles for dynamic styles

### Component Patterns

```tsx
// Props interface
interface TaskItemProps {
  name: string;
  dueDate?: Date | null;
  isCompleted: boolean;
  onPress: () => void;
}

// Component with destructured props
export function TaskItem({
  name,
  dueDate,
  isCompleted,
  onPress,
}: TaskItemProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* implementation */}
    </TouchableOpacity>
  );
}
```

### Testing (packages/core)

- Test files use `.test.ts` extension in `test/` directory
- Use Vitest with `describe`, `it`, `expect`, `beforeEach`
- Use `createTestDatabase()` from `test/setup.js` for test fixtures

### Key Configuration Files

- **tsconfig.json**: Strict mode, path aliases (`@/*`)
- **eslint.config.js**: Expo ESLint config
- **vitest.config.ts** (core): Test environment setup

### Dependencies

- **Mobile**: Expo 54, React Native 0.81, React Navigation 7, expo-router
- **Core**: better-sqlite3, uuid, zod, rrule, vitest