const UNIT_MAP: Record<string, number> = {
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  m: 30 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
};

export function isDueRuleRelative(rule: string | null): boolean {
  if (!rule) return false;
  return rule.startsWith("+");
}

export function parseDueRuleToFixed(
  rule: string,
  baseDate: Date = new Date(),
): Date {
  const parts = rule.trim().split(/\s+/);

  if (parts.length === 0) {
    return new Date(rule);
  }

  const relativePart = parts[0]!;
  const timePart = parts[1] ?? "00:00:00";

  const match = relativePart.match(/^\+(\d+)([dwmy])$/);
  if (!match) {
    return new Date(rule);
  }

  const value = match[1];
  const unit = match[2]!;
  const multiplier = UNIT_MAP[unit];

  if (!value || !multiplier) {
    return new Date(rule);
  }

  const baseTime = baseDate.getTime();
  const offset = parseInt(value, 10) * multiplier;
  const resultDate = new Date(baseTime + offset);

  const [hours = 0, minutes = 0, seconds = 0] = timePart.split(":").map(Number);
  resultDate.setHours(hours, minutes, seconds, 0);

  return resultDate;
}

export function calculateDueDate(rule: string, baseDate: Date): Date {
  return parseDueRuleToFixed(rule, baseDate);
}
