import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { DayRecord } from '@/types';
import { getShortDayName, getTodayKey } from '@/utils/dateUtils';
import { COLORS } from '@/constants';

interface Props {
  records: Record<string, DayRecord>;
  dates: string[];
  goalMl: number;
}

const CHART_HEIGHT = 140;
const BAR_BORDER_RADIUS = 8;

export function WaterChart({ records, dates, goalMl }: Props) {
  const values = dates.map((d) => records[d]?.totalMl ?? 0);
  const maxValue = Math.max(...values, goalMl, 500);
  const todayKey = getTodayKey();

  // Dimensions calculated per bar inside render
  const barCount = dates.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartArea}>
        {/* Goal line label */}
        <Text style={styles.goalLabel}>Goal</Text>

        <View style={styles.barsRow}>
          {dates.map((date, i) => {
            const value = values[i];
            const barHeight = Math.max((value / maxValue) * CHART_HEIGHT, value > 0 ? 4 : 0);
            const goalLineY = (goalMl / maxValue) * CHART_HEIGHT;
            const isToday = date === todayKey;
            const isGoalMet = value >= goalMl;

            return (
              <View key={date} style={styles.barColumn}>
                <View style={[styles.barContainer, { height: CHART_HEIGHT }]}>
                  {/* Goal dashed line drawn via absolute positioning */}
                  <View
                    style={[
                      styles.goalLine,
                      { bottom: goalLineY },
                    ]}
                  />

                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isGoalMet
                          ? COLORS.success
                          : isToday
                          ? COLORS.primary
                          : COLORS.primaryLight,
                        opacity: isToday ? 1 : 0.75,
                        borderRadius: BAR_BORDER_RADIUS,
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
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
  },
  chartArea: {
    position: 'relative',
  },
  goalLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    position: 'absolute',
    right: 0,
    top: 0,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'visible',
  },
  goalLine: {
    position: 'absolute',
    left: -3,
    right: -3,
    height: 1.5,
    backgroundColor: COLORS.warning,
    opacity: 0.5,
  },
  bar: {
    width: '100%',
    minHeight: 4,
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
});
