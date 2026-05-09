# Date Timezone Fix Plan

## Problem
Occurrence dates for recurrent tasks show the wrong day in the app (day before) because:
- Dates are stored as UTC datetime (e.g., `2025-01-15T00:00:00.000Z`)
- When converted to local time (GMT-3), it becomes `2025-01-14 21:00:00`
- This causes the "day before" display issue

## Solution
Store occurrence dates as **date-only strings** (`YYYY-MM-DD` format) instead of full ISO datetimes.

## Changes Required

### 1. Database Layer (`packages/core/src/database/repositories/TasksRepository.ts`)
- Update `findByTaskAndOccurrence()` to accept and compare date-only strings
- Update `TaskExceptionsRepository.findByTaskAndOccurrence()` same way
- Update `TaskExceptionsRepository.upsert()` to store date-only strings

### 2. Service Layer (`packages/core/src/services/TasksService.ts`)
- Update `getAllOccurrences()` to return date-only strings instead of Date objects
- Update `getOccurrencesInRange()` same way
- Update all methods that pass occurrence dates to use strings
- Update `startExecution()`, `startMultipleExecutions()` to handle date strings
- Update `calculateDueDateForOccurrence()` to parse date strings properly

### 3. Schemas/Types (`packages/core/src/schemas/tasks.ts`)
- Change `ocurrence_date` in interfaces from `Date | null` to `string | null`
- Update `TaskWithProgress`, `TaskInRange`, `TaskOccurrenceDetail`, `TaskWithListInfo`

### 4. Mobile App UI
- Update `[listId].tsx` to pass date-only string in URL params
- Update `[taskId].tsx` to parse date-only string back to Date object for display
- Ensure date comparisons work correctly

### 5. Tests
- Update any tests that use occurrence dates to use date-only format

## Implementation Order
1. Database layer changes
2. Service layer changes
3. Schema/type updates
4. Mobile app UI updates
5. Test updates
6. Run tests to verify
