# Agents Documentation

This file provides guidelines for agents operating in the personal-space repository.

## Repository Structure

```
personal-space/                          # npm workspaces monorepo
├── apps/
│   ├── personal-space-mobile/           # Expo mobile app (React Native)
│   ├── personal-space-desktop/          # Desktop app (Tauri + Vite + React)
│   └── personal-space-cli/              # CLI app (oclif)
├── packages/
│   └── core/                            # personal-space-core (shared business logic)
├── assets/                              # Static assets (logos, icons)
└── documentation/                       # Project documentation
```

## Build, Lint, and Test Commands

### Mobile App (apps/personal-space-mobile)

```bash
# Development
npm run start        # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web

# Linting & Type Checking
npm run lint        # Run ESLint (expo lint)
npx tsc --noEmit    # TypeScript type check

# Build
npx expo export      # Export for production
```

### Desktop App (apps/personal-space-desktop)

```bash
# Development
npm run dev          # Start Vite dev server
npm run preview      # Preview production build

# Linting & Build
npm run lint         # Run ESLint
npm run build        # TypeScript + Vite build (tsc -b && vite build)
```

### CLI App (apps/personal-space-cli)

```bash
# Development
./bin/run.js         # Run CLI directly (after build)

# Linting & Build
npm run lint         # Run ESLint (oclif + prettier config)
npm run build        # Clean and compile TypeScript (shx rm -rf dist && tsc -b)

# Testing
npm run test         # Run Mocha tests (test/**/*.test.ts)
```

### Core Package (packages/core)

```bash
# Development
cd packages/core
npm run build        # TypeScript build (outputs to dist/)

# Testing
npm run test         # Run Vitest in watch mode
npm run test:run     # Run Vitest tests once

# Running a single test file
cd packages/core
npx vitest run test/services/tasks.test.ts          # Run specific test file
npx vitest run --testNamePattern="createTask"       # Run tests matching pattern
npx vitest run -t "createTask"                      # Shorthand for testNamePattern
```

## Code Style Guidelines

### General Principles

- Use strict TypeScript (strict mode enabled in all tsconfig.json files)
- Prefer functional components and hooks
- Use early returns for error/loading states
- Constants should be in dedicated files (e.g., `constants/theme.ts`)

### Imports

- Use path aliases: `@/` maps to project root (mobile app)
- Group imports: React/Native first, then third-party, then local
- Use ES module syntax (all packages use `"type": "module"`)
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
- Core package enables `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`

### Error Handling

- Use try-catch for async operations
- Log errors with `console.error()` before alerting users
- Show user-friendly errors via `Alert.alert("Error", "User message")` (mobile)
- Handle loading and error states explicitly in components

### Styling

- Use `StyleSheet.create()` for React Native styles (mobile)
- Colors: Use hex codes from constants/theme.ts
- Spacing: Use constants from constants/spacing.ts
- Use `gap` instead of margin for spacing between flex children

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

## Testing

### Core Package (Vitest)

- Test files use `.test.ts` extension in `test/` directory
- Use Vitest with `describe`, `it`, `expect`, `beforeEach`
- Use `createTestDatabase()` from `test/setup.js` for test fixtures
- Environment: node (configured in vitest.config.ts)

### CLI App (Mocha + Chai)

- Test files use `.test.ts` extension in `test/` directory
- Use Mocha with Chai assertions
- Run with `npm run test` from apps/personal-space-cli

## Performance Guidelines

### Core Rendering (CRITICAL)

- Never use `{value && <Component />}` with potentially falsy values (0, "")
- Always wrap strings in `<Text>` components
- Use ternary with `null` or explicit boolean coercion: `{!!value && <Component />}`

### List Performance (HIGH)

- Use virtualized lists (FlatList, FlashList, LegendList) not ScrollView with map
- Avoid inline objects in renderItem - pass item directly or primitives
- Hoist callbacks outside renderItem, pass item ID instead of closures
- Keep list items lightweight - no queries, minimal hooks, pass pre-computed values

### Animation (HIGH)

- Animate transform and opacity, never layout properties (width, height, margin)
- Use `useDerivedValue` for deriving values, not `useAnimatedReaction`
- Use GestureDetector for animated press states

### State Management

- Minimize state variables - derive values instead of storing
- Use dispatch updaters (`setState(prev => ...)`) for state that depends on current value
- State should represent ground truth, not derived visual values

## Key Dependencies

- **Mobile**: Expo 54, React Native 0.81, React Navigation 7, expo-router, react-native-reanimated
- **Desktop**: Tauri 2, Vite 7, React 19
- **CLI**: oclif 4, better-sqlite3
- **Core**: better-sqlite3, uuid, zod, rrule, vitest

## Available Skills

- `react-native-design` - Styling, navigation, and Reanimated patterns
- `react-native-architecture` - Production patterns, offline sync
- `vercel-react-native-skills` - 35+ performance optimization rules
- `find-skills` - For discovering additional capabilities
