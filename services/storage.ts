import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayRecord, AppSettings, WaterEntry, BottleEntry, BottleReturn, BottleKind } from '@/types';
import { STORAGE_KEYS, DEFAULT_DAILY_GOAL_ML } from '@/constants';
import { getTodayKey, generateEntryId } from '@/utils/dateUtils';

// Wypełnienie danymi demo przy pierwszym uruchomieniu
async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.WATER_RECORDS);
    if (existing) return; // already has data
    const seed = {"2026-05-13":{"date":"2026-05-13","entries":[{"id":"entry_1778878610156_yqxezzh","amount":250,"timestamp":1778649960000},{"id":"entry_1779207630210_0929j16","amount":330,"timestamp":1778657700000},{"id":"entry_1778863516688_6rcky7c","amount":250,"timestamp":1778663100000},{"id":"entry_1778917552349_e7wj4x6","amount":500,"timestamp":1778671320000},{"id":"entry_1778354276085_2bqt5pa","amount":250,"timestamp":1778680260000},{"id":"entry_1778802328032_roqi204","amount":330,"timestamp":1778688720000},{"id":"entry_1778928586561_u0bx7k5","amount":250,"timestamp":1778697720000}],"totalMl":2160},"2026-05-14":{"date":"2026-05-14","entries":[{"id":"entry_1778811019293_f6q1w7u","amount":250,"timestamp":1778736240000},{"id":"entry_1778700246510_u886xnq","amount":330,"timestamp":1778744160000},{"id":"entry_1779169570381_c10f5mk","amount":250,"timestamp":1778749500000},{"id":"entry_1778542371587_tgy6laz","amount":500,"timestamp":1778757840000},{"id":"entry_1778519823840_n55303u","amount":250,"timestamp":1778767140000}],"totalMl":1580},"2026-05-15":{"date":"2026-05-15","entries":[{"id":"entry_1778813341813_z2gbkb2","amount":250,"timestamp":1778822580000},{"id":"entry_1778829701805_fhe383b","amount":330,"timestamp":1778830440000},{"id":"entry_1778245666754_6czu28b","amount":250,"timestamp":1778836020000},{"id":"entry_1778275380408_9kcfpo8","amount":500,"timestamp":1778844060000},{"id":"entry_1778742766268_qh9x8mq","amount":250,"timestamp":1778853360000},{"id":"entry_1778866462246_xq9lo00","amount":330,"timestamp":1778860800000},{"id":"entry_1778878157670_s32cfk6","amount":250,"timestamp":1778869980000}],"totalMl":2160},"2026-05-16":{"date":"2026-05-16","entries":[{"id":"entry_1778722053825_nfjr7vf","amount":250,"timestamp":1778909160000},{"id":"entry_1778237438771_rd694q6","amount":330,"timestamp":1778916900000},{"id":"entry_1779045944511_yxj5q14","amount":250,"timestamp":1778922360000},{"id":"entry_1778561185518_4i4jnze","amount":500,"timestamp":1778930880000},{"id":"entry_1779033297201_4nilmqu","amount":250,"timestamp":1778939760000},{"id":"entry_1778740923968_5zmyutq","amount":330,"timestamp":1778947260000}],"totalMl":1910},"2026-05-17":{"date":"2026-05-17","entries":[{"id":"entry_1778270964587_df3u7tk","amount":250,"timestamp":1778995380000},{"id":"entry_1778851497445_s3nb6ix","amount":330,"timestamp":1779003660000},{"id":"entry_1778797844900_zvy920i","amount":250,"timestamp":1779008640000},{"id":"entry_1778688548143_n2aemij","amount":500,"timestamp":1779017340000},{"id":"entry_1778792962451_tav8gql","amount":250,"timestamp":1779025560000},{"id":"entry_1778338114051_zo5jo1e","amount":330,"timestamp":1779034440000},{"id":"entry_1778948019015_2zyae10","amount":250,"timestamp":1779043140000}],"totalMl":2160},"2026-05-18":{"date":"2026-05-18","entries":[{"id":"entry_1778784164965_rn2w01w","amount":250,"timestamp":1779082080000},{"id":"entry_1778514650624_e76em2h","amount":330,"timestamp":1779090180000},{"id":"entry_1779127082366_274al88","amount":250,"timestamp":1779095340000},{"id":"entry_1779055845708_cfa5mdi","amount":500,"timestamp":1779103260000}],"totalMl":1330},"2026-05-19":{"date":"2026-05-19","entries":[{"id":"entry_1779076369389_95494kz","amount":250,"timestamp":1779168000000},{"id":"entry_1778276033339_mf6p5la","amount":330,"timestamp":1779175980000},{"id":"entry_1779116064131_tgo96co","amount":250,"timestamp":1779181200000},{"id":"entry_1778238734016_ol7iuji","amount":500,"timestamp":1779189960000},{"id":"entry_1778709043344_wgemi6w","amount":250,"timestamp":1779198660000},{"id":"entry_1779072716761_enlomkl","amount":330,"timestamp":1779206700000},{"id":"entry_1778922766986_5xzjcg9","amount":250,"timestamp":1779215700000}],"totalMl":2160}};
    await AsyncStorage.setItem(STORAGE_KEYS.WATER_RECORDS, JSON.stringify(seed));
    const existingSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!existingSettings) {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({"dailyGoalMl":2000,"unit":"ml"}));
    }
  } catch {}
}
// Call once on module load
seedDemoDataIfEmpty();

// ─── Rekordy ──────────────────────────────────────────────────────────────────

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
  await AsyncStorage.multiRemove([STORAGE_KEYS.WATER_RECORDS, STORAGE_KEYS.BOTTLE_RETURNS]);
}

// ─── Butelki ──────────────────────────────────────────────────────────────────

export async function addBottleEntry(
  kind: BottleKind,
  sizeL: number,
  depositZl: number,
): Promise<DayRecord> {
  const key      = getTodayKey();
  const records  = await getAllRecords();
  const existing = records[key] ?? { date: key, entries: [], totalMl: 0, bottles: [] };

  const bottleEntry: BottleEntry = {
    id: generateEntryId(), kind, sizeL, depositZl, timestamp: Date.now(),
  };

  const updated: DayRecord = {
    ...existing,
    bottles: [...(existing.bottles ?? []), bottleEntry],
  };

  records[key] = updated;
  await saveAllRecords(records);
  return updated;
}

export async function getBottleReturns(): Promise<BottleReturn[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BOTTLE_RETURNS);
  return raw ? JSON.parse(raw) : [];
}

export async function addBottleReturn(count: number, earnedZl: number): Promise<void> {
  const returns  = await getBottleReturns();
  const entry: BottleReturn = {
    id: generateEntryId(), count, earnedZl, timestamp: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.BOTTLE_RETURNS, JSON.stringify([...returns, entry]));
}

export async function getAllBottlesUsed(): Promise<BottleEntry[]> {
  const records = await getAllRecords();
  return Object.values(records).flatMap(r => r.bottles ?? []);
}

// ─── Ustawienia ───────────────────────────────────────────────────────────────

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
