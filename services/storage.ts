import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayRecord, AppSettings, WaterEntry } from '@/types';
import { STORAGE_KEYS, DEFAULT_DAILY_GOAL_ML } from '@/constants';
import { getTodayKey, generateEntryId } from '@/utils/dateUtils';

// ─── Records ──────────────────────────────────────────────────────────────────

async function getAllRecords(): Promise<Record<string, DayRecord>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.WATER_RECORDS);
  return raw ? JSON.parse(raw) : {};
}

async function saveAllRecords(records: Record<string, DayRecord>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.WATER_RECORDS, JSON.stringify(records));
}

export async function getTodayRecord(): Promise<DayRecord> {
  const key = getTodayKey();
  const records = await getAllRecords();

  return (
    records[key] ?? {
      date: key,
      entries: [],
      totalMl: 0,
    }
  );
}

export async function getRecordByDate(date: string): Promise<DayRecord | null> {
  const records = await getAllRecords();
  return records[date] ?? null;
}

export async function getRecordsForDates(dates: string[]): Promise<Record<string, DayRecord>> {
  const records = await getAllRecords();
  const result: Record<string, DayRecord> = {};

  for (const date of dates) {
    result[date] = records[date] ?? {
      date,
      entries: [],
      totalMl: 0,
    };
  }

  return result;
}

export async function addWaterEntry(amountMl: number): Promise<DayRecord> {
  const key = getTodayKey();
  const records = await getAllRecords();

  const existing = records[key] ?? { date: key, entries: [], totalMl: 0 };

  const newEntry: WaterEntry = {
    id: generateEntryId(),
    amount: amountMl,
    timestamp: Date.now(),
  };

  const updated: DayRecord = {
    ...existing,
    entries: [...existing.entries, newEntry],
    totalMl: existing.totalMl + amountMl,
  };

  records[key] = updated;
  await saveAllRecords(records);

  return updated;
}

export async function undoLastEntry(): Promise<DayRecord> {
  const key = getTodayKey();
  const records = await getAllRecords();
  const existing = records[key];

  if (!existing || existing.entries.length === 0) {
    return existing ?? { date: key, entries: [], totalMl: 0 };
  }

  const entries = [...existing.entries];
  const removed = entries.pop()!;

  const updated: DayRecord = {
    ...existing,
    entries,
    totalMl: Math.max(0, existing.totalMl - removed.amount),
  };

  records[key] = updated;
  await saveAllRecords(records);

  return updated;
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.WATER_RECORDS);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!raw) {
    return { dailyGoalMl: DEFAULT_DAILY_GOAL_ML, unit: 'ml' };
  }
  return JSON.parse(raw);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
