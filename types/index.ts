export interface DayRecord {
  date: string;
  entries: WaterEntry[];
  totalMl: number;
  bottles?: BottleEntry[];  // opcjonalne — kompatybilność wsteczna
}

export interface WaterEntry {
  id: string;
  amount: number;    // w ml
  timestamp: number; // ms od epoch
}

export type BottleKind = 'PET' | 'CAN' | 'GLASS';

export interface BottleEntry {
  id: string;
  kind: BottleKind;
  sizeL: number;
  depositZl: number;
  timestamp: number;
}

export interface BottleReturn {
  id: string;
  count: number;
  earnedZl: number;
  timestamp: number;
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
