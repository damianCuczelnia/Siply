import { useState, useEffect, useCallback } from 'react';
import { DayRecord } from '@/types';
import {
  getTodayRecord,
  addWaterEntry,
  undoLastEntry,
  getRecordsForDates,
} from '@/services/storage';
import { getLast7DaysKeys } from '@/utils/dateUtils';

interface WaterDataState {
  todayRecord: DayRecord | null;
  weekRecords: Record<string, DayRecord>;
  isLoading: boolean;
}

export function useWaterData() {
  const [state, setState] = useState<WaterDataState>({
    todayRecord: null,
    weekRecords: {},
    isLoading: true,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const [today, weekRecords] = await Promise.all([
      getTodayRecord(),
      getRecordsForDates(getLast7DaysKeys()),
    ]);
    setState({ todayRecord: today, weekRecords, isLoading: false });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addWater = useCallback(async (amountMl: number) => {
    const updated = await addWaterEntry(amountMl);
    setState((prev) => ({
      ...prev,
      todayRecord: updated,
      weekRecords: {
        ...prev.weekRecords,
        [updated.date]: updated,
      },
    }));
  }, []);

  const undoLast = useCallback(async () => {
    const updated = await undoLastEntry();
    setState((prev) => ({
      ...prev,
      todayRecord: updated,
      weekRecords: {
        ...prev.weekRecords,
        [updated.date]: updated,
      },
    }));
  }, []);

  return {
    ...state,
    addWater,
    undoLast,
    refresh: loadData,
  };
}
