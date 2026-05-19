import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayRecord } from '@/types';
import { getShortDayName, getTodayKey } from '@/utils/dateUtils';
import { COLORS } from '@/constants';

interface Props {
  records: Record<string, DayRecord>;
  dates:   string[];
  goalMl:  number;
}

const CHART_H = 140;  // stała wysokość obszaru słupków — linia celu się nie przesuwa

export function WaterChart({ records, dates, goalMl }: Props) {
  const todayKey = getTodayKey();
  const values   = dates.map(d => records[d]?.totalMl ?? 0);

  // Skala: 30% zapasu nad najwyższą wartością lub celem — cokolwiek jest większe.
  // maxValue nigdy nie spada poniżej goalMl, żeby linia celu stała w miejscu.
  const maxValue     = Math.max(...values, goalMl) * 1.3;
  const goalLineFromBottom = (goalMl / maxValue) * CHART_H;  // px from bottom of chart area

  return (
    <View style={styles.wrapper}>

      {/* ── Bar area (fixed height) ── */}
      <View style={[styles.chartArea, { height: CHART_H }]}>

        {/* Bars — aligned to bottom inside the fixed-height area */}
        <View style={styles.barsRow}>
          {dates.map((date, i) => {
            const value    = values[i];
            const barH     = Math.max((value / maxValue) * CHART_H, value > 0 ? 4 : 0);
            const isToday  = date === todayKey;
            const goalMet  = value >= goalMl;
            return (
              <View key={date} style={styles.barSlot}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barH,
                      backgroundColor: goalMet
                        ? COLORS.success
                        : isToday
                        ? COLORS.primary
                        : COLORS.primaryLight,
                      opacity: isToday ? 1 : 0.75,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Single goal line — absolutely positioned in the fixed chart area */}
        <View style={[styles.goalLine, { bottom: goalLineFromBottom }]} pointerEvents="none" />

        {/* Goal label — just above the line */}
        <Text
          style={[styles.goalLabel, { bottom: goalLineFromBottom + 3 }]}
          pointerEvents="none"
        >
          Cel
        </Text>
      </View>

      {/* ── Labels row — completely separate from chart area ── */}
      <View style={styles.labelsRow}>
        {dates.map((date, i) => {
          const value    = values[i];
          const isToday  = date === todayKey;
          const bottleZl = records[date]?.bottles?.reduce((s, b) => s + b.depositZl, 0) ?? 0;
          return (
            <View key={date} style={styles.labelSlot}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {getShortDayName(date)}
              </Text>
              {value > 0 && (
                <Text style={styles.valueLabel}>
                  {value >= 1000 ? `${(value / 1000).toFixed(1)}L` : `${value}`}
                </Text>
              )}
              {bottleZl > 0 && (
                <Text style={styles.bottleLabel}>+{bottleZl.toFixed(2)} zł</Text>
              )}
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 8 },

  chartArea: {
    position: 'relative',
    overflow: 'visible',
  },

  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: '100%',
  },

  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },

  bar: {
    width: '100%',
    borderRadius: 8,
  },

  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: COLORS.warning,
    opacity: 0.6,
  },

  goalLabel: {
    position: 'absolute',
    right: 0,
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  labelsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },

  labelSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  dayLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  valueLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bottleLabel: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '700',
  },
});
