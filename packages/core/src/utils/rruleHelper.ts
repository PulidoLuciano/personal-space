import { RRule } from "rrule";

export function validateRRule(rruleString: string | null): boolean {
  if (!rruleString) return false;

  try {
    RRule.fromString(rruleString);
    return true;
  } catch {
    return false;
  }
}

export function createRRule(rruleString: string): RRule | null {
  if (!rruleString) return null;

  try {
    return RRule.fromString(rruleString);
  } catch {
    return null;
  }
}
