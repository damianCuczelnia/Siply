import { useState, useEffect, useCallback } from 'react';
import { DayRecord, BottleReturn, BottleKind } from '@/types';
import {
  getTodayRecord,
  addWaterEntry,
  undoLastEntry,
  getRecordsForDates,
  addBottleEntry,
  getBottleReturns,
  addBottleReturn,
  getAllBottlesUsed,
} from '@/services/storage';
import { getLast7DaysKeys } from '@/utils/dateUtils';

interface WaterDataState {
  todayRecord:        DayRecord | null;
  weekRecords:        Record<string, DayRecord>;
  isLoading:          boolean;
  bottleReturns:      BottleReturn[];
  pendingBottles:     number;   // butelki czekające na zwrot
  pendingZl:          number;   // kaucja do odzyskania
  totalEarnedZl:      number;   // łączne zarobki z kaucji
  totalReturnedCount: number;   // łączna liczba oddanych butelek
}

export function useWaterData() {
  const [state, setState] = useState<WaterDataState>({
    todayRecord:        null,
    weekRecords:        {},
    isLoading:          true,
    bottleReturns:      [],
    pendingBottles:     0,
    pendingZl:          0,
    totalEarnedZl:      0,
    totalReturnedCount: 0,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const [today, weekRecords, returns, allBottles] = await Promise.all([
      getTodayRecord(),
      getRecordsForDates(getLast7DaysKeys()),
      getBottleReturns(),
      getAllBottlesUsed(),
    ]);

    const totalUsed          = allBottles.length;
    const totalReturnedCount = returns.reduce((s, r) => s + r.count, 0);
    const pendingBottles     = Math.max(0, totalUsed - totalReturnedCount);
    const pendingZl          = allBottles
      .slice(totalReturnedCount)
      .reduce((s, b) => s + b.depositZl, 0);
    const totalEarnedZl      = returns.reduce((s, r) => s + r.earnedZl, 0);

    setState({
      todayRecord: today,
      weekRecords,
      isLoading: false,
      bottleReturns:    returns,
      pendingBottles,
      pendingZl:        Math.max(0, pendingZl),
      totalEarnedZl,
      totalReturnedCount,
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addWater = useCallback(async (amountMl: number) => {
    const updated = await addWaterEntry(amountMl);
    setState((prev) => ({
      ...prev,
      todayRecord: updated,
      weekRecords: { ...prev.weekRecords, [updated.date]: updated },
    }));
  }, []);

  const undoLast = useCallback(async () => {
    const updated = await undoLastEntry();
    setState((prev) => ({
      ...prev,
      todayRecord: updated,
      weekRecords: { ...prev.weekRecords, [updated.date]: updated },
    }));
  }, []);

  const addBottle = useCallback(async (
    kind: BottleKind, sizeL: number, depositZl: number,
  ) => {
    const updated = await addBottleEntry(kind, sizeL, depositZl);
    setState((prev) => ({
      ...prev,
      todayRecord: updated,
      weekRecords: { ...prev.weekRecords, [updated.date]: updated },
      pendingBottles: prev.pendingBottles + 1,
      pendingZl:      prev.pendingZl + depositZl,
    }));
  }, []);

  const returnBottles = useCallback(async (count: number, earnedZl: number) => {
    await addBottleReturn(count, earnedZl);
    setState((prev) => ({
      ...prev,
      pendingBottles:     Math.max(0, prev.pendingBottles - count),
      pendingZl:          Math.max(0, prev.pendingZl - earnedZl),
      totalEarnedZl:      prev.totalEarnedZl + earnedZl,
      totalReturnedCount: prev.totalReturnedCount + count,
      bottleReturns:      [
        ...prev.bottleReturns,
        { id: '', count, earnedZl, timestamp: Date.now() },
      ],
    }));
  }, []);

  return {
    ...state,
    addWater,
    undoLast,
    addBottle,
    returnBottles,
    refresh: loadData,
  };
}
