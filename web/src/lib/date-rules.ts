export function todayDateOnly(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isBeforeToday(value: string): boolean {
  return value.length > 0 && value < todayDateOnly();
}

export function isAfterToday(value: string): boolean {
  return value.length > 0 && value > todayDateOnly();
}

export function clampToToday(value: string): string {
  return isAfterToday(value) ? todayDateOnly() : value;
}
