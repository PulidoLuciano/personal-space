import { RRule } from "rrule";

export function formatRecurrency(rruleStr: string): string {
  try {
    const rrule = RRule.fromString(rruleStr);
    return rrule.toText();
  } catch {
    return rruleStr;
  }
}

export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatDueRule(dueRule: string): string {
  const relativeMatch = dueRule.match(
    /^\+(\d+)([dwmy])\s+(\d{2}:\d{2}):\d{2}$/,
  );
  if (relativeMatch) {
    const count = relativeMatch[1];
    const unitMap: Record<string, string> = {
      d: "day",
      w: "week",
      m: "month",
      y: "year",
    };
    const unit = unitMap[relativeMatch[2]] || "day";
    const time = relativeMatch[3];
    const plural = count === "1" ? "" : "s";
    return `${count} ${unit}${plural} after at ${time}`;
  }
  const fixedMatch = dueRule.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}):\d{2}$/,
  );
  if (fixedMatch) {
    const date = new Date(fixedMatch[1] + "T" + fixedMatch[2]);
    return (
      date.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
  return dueRule;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
