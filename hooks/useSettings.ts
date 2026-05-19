import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { getSettings, saveSettings } from '@/services/storage';
import { DEFAULT_DAILY_GOAL_ML } from '@/constants';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    dailyGoalMl: DEFAULT_DAILY_GOAL_ML,
    unit: 'ml',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  return { settings, updateSettings, isLoading };
}
