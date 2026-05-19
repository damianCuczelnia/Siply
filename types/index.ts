export interface DayRecord {
  date: string; // format: YYYY-MM-DD
  entries: WaterEntry[];
  totalMl: number;
}

export interface WaterEntry {
  id: string;
  amount: number; // in ml
  timestamp: number; // Unix timestamp in ms
}

export interface AppSettings {
  dailyGoalMl: number;
  unit: 'ml' | 'oz';
}

export interface Statistics {
  weekData: DayRecord[];
  averageMl: number;
  bestDayMl: number;
  bestDate: string;
  goalsMetCount: number;
  totalDays: number;
}
