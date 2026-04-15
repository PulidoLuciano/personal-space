import RRule from "rrule";

export function validateRRule(rruleString: string | null): boolean {
  if (!rruleString) return false;

  try {
    RRule.RRule.fromString(rruleString);
    return true;
  } catch {
    return false;
  }
}

export function createRRule(rruleString: string): InstanceType<typeof RRule.RRule> | null {
  if (!rruleString) return null;

  try {
    return RRule.RRule.fromString(rruleString);
  } catch {
    return null;
  }
}
