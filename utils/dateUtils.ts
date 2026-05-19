export function getTodayKey(): string {
  const now = new Date();
  return formatDateKey(now);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(key: string): string {
  const date = parseDateKey(key);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (formatDateKey(date) === formatDateKey(today)) return 'Today';
  if (formatDateKey(date) === formatDateKey(yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getShortDayName(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getLast7DaysKeys(): string[] {
  const keys: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    keys.push(formatDateKey(date));
  }

  return keys;
}

export function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
