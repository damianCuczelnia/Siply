export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function formatDateKey(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
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

  if (formatDateKey(date) === formatDateKey(today)) return 'Dziś';
  if (formatDateKey(date) === formatDateKey(yesterday)) return 'Wczoraj';

  return date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' });
}

export function getShortDayName(key: string): string {
  const date = parseDateKey(key);
  // Capitalize first letter so it's "Pon", "Wt" etc.
  const name = date.toLocaleDateString('pl-PL', { weekday: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1).replace('.', '');
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
