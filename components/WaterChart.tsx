import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayRecord } from '@/types';
import { getShortDayName, getTodayKey } from '@/utils/dateUtils';
import { COLORS } from '@/constants';

interface Props {
  records:        Record<string, DayRecord>;
  dates:          string[];
  goalMl:         number;
}

const CHART_HEIGHT = 140;
const BAR_RADIUS   = 8;
const PADDING_TOP  = 20;   // room for "Cel" label above the goal line

export function WaterChart({ records, dates, goalMl }: Props) {
  const todayKey = getTodayKey();
  const values   = dates.map(d => records[d]?.totalMl ?? 0);

  // Fixed scale: always 30% above the highest of (data, goal) — goal line never moves
  const maxData  = Math.max(...values, 1);
  const maxValue = Math.max(maxData, goalMl) * 1.3;

  // Goal line position from top of bar area (used for label)
  const goalFraction = goalMl / maxValue;           // 0..1
  const goalFromTop  = CHART_HEIGHT * (1 - goalFraction);  // px from top of bar container

  return (
    <View style={styles.wrapper}>
      {/* "Cel" label floated to the goal line position */}
      <View style={[styles.goalLabelWrap, { top: PADDING_TOP + goalFromTop - 9 }]}>
        <Text style={styles.goalLabel}>Cel</Text>
      </View>

      <View style={styles.barsRow}>
        {dates.map((date, i) => {
          const value     = values[i];
          const barH      = Math.max((value / maxValue) * CHART_HEIGHT, value > 0 ? 4 : 0);
          const goalLineY = goalFraction * CHART_HEIGHT;   // from bottom
          const isToday   = date === todayKey;
          const isGoalMet = value >= goalMl;

          const bottleZl = records[date]?.bottles?.reduce((s, b) => s + b.depositZl, 0) ?? 0;

          return (
            <View key={date} style={styles.barColumn}>
              <View style={[styles.barContainer, { height: CHART_HEIGHT }]}>
                {/* Goal dashed line */}
                <View style={[styles.goalLine, { bottom: goalLineY }]} />

                {/* Bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barH,
                      backgroundColor: isGoalMet
                        ? COLORS.success
                        : isToday
                        ? COLORS.primary
                        : COLORS.primaryLight,
                      opacity: isToday ? 1 : 0.75,
                    },
                  ]}
                />
              </View>

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
  wrapper: {
    paddingTop: PADDING_TOP,
    position: 'relative',
  },
  goalLabelWrap: {
    position: 'absolute',
    right: 0,
  },
  goalLabel: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: -3,
    right: -3,
    height: 1.5,
    backgroundColor: COLORS.warning,
    opacity: 0.55,
  },
  bar: {
    width: '100%',
    borderRadius: BAR_RADIUS,
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
