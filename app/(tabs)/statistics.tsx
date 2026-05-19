import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { WaterChart } from '@/components/WaterChart';
import { StatCard } from '@/components/StatCard';
import { useWaterData } from '@/hooks/useWaterData';
import { useSettings } from '@/hooks/useSettings';
import { COLORS } from '@/constants';
import { getLast7DaysKeys, formatDisplayDate } from '@/utils/dateUtils';

export default function StatisticsScreen() {
  const { weekRecords, isLoading, refresh } = useWaterData();
  const { settings } = useSettings();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const last7Days = getLast7DaysKeys();
  const goalMl = settings.dailyGoalMl;

  // Compute stats from the 7 days
  const dayValues = last7Days.map((d) => weekRecords[d]?.totalMl ?? 0);
  const daysWithData = dayValues.filter((v) => v > 0);

  const averageMl =
    daysWithData.length > 0
      ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length)
      : 0;

  const bestDayMl = daysWithData.length > 0 ? Math.max(...daysWithData) : 0;
  const bestDayIndex = dayValues.indexOf(bestDayMl);
  const bestDate =
    bestDayMl > 0 && bestDayIndex >= 0 ? last7Days[bestDayIndex] : null;

  const goalsMetCount = dayValues.filter((v) => v >= goalMl).length;
  const totalWeekMl = dayValues.reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loading}>
        <Text style={styles.loadingText}>📊</Text>
      </LinearGradient>
    );
  }

  const hasData = daysWithData.length > 0;

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.subtitle}>Last 7 days overview</Text>
          </View>

          {hasData ? (
            <>
              {/* Chart card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Daily intake</Text>
                <WaterChart
                  records={weekRecords}
                  dates={last7Days}
                  goalMl={goalMl}
                />
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={styles.legendText}>Intake</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.legendText}>Goal met</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                    <Text style={styles.legendText}>Goal line</Text>
                  </View>
                </View>
              </View>

              {/* Stats grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                  <StatCard
                    emoji="📊"
                    value={averageMl >= 1000 ? `${(averageMl / 1000).toFixed(1)}L` : `${averageMl} ml`}
                    label="Daily average"
                  />
                  <StatCard
                    emoji="🏆"
                    value={bestDayMl >= 1000 ? `${(bestDayMl / 1000).toFixed(1)}L` : `${bestDayMl} ml`}
                    label="Best day"
                  />
                </View>
                <View style={styles.statsRow}>
                  <StatCard
                    emoji="✅"
                    value={`${goalsMetCount} / 7`}
                    label="Goals met"
                  />
                  <StatCard
                    emoji="💧"
                    value={
                      totalWeekMl >= 1000
                        ? `${(totalWeekMl / 1000).toFixed(1)}L`
                        : `${totalWeekMl} ml`
                    }
                    label="Total this week"
                  />
                </View>
              </View>

              {/* Best day info */}
              {bestDate && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Best performance</Text>
                  <View style={styles.bestDayRow}>
                    <Text style={styles.trophyEmoji}>🏆</Text>
                    <View>
                      <Text style={styles.bestDayDate}>{formatDisplayDate(bestDate)}</Text>
                      <Text style={styles.bestDayAmount}>
                        {bestDayMl >= 1000
                          ? `${(bestDayMl / 1000).toFixed(2)} L`
                          : `${bestDayMl} ml`}
                        {bestDayMl >= goalMl && (
                          <Text style={styles.goalBadge}> · Goal ✓</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Goal hit rate */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Goal completion</Text>
                <View style={styles.goalBarWrapper}>
                  <View style={styles.goalBarTrack}>
                    <View
                      style={[
                        styles.goalBarFill,
                        { width: `${(goalsMetCount / 7) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.goalBarLabel}>
                    {goalsMetCount === 0
                      ? 'No goals met yet'
                      : `${Math.round((goalsMetCount / 7) * 100)}% of days`}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            /* Empty state */
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking your water intake on the Today tab and come back here to see your progress.
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { fontSize: 48 },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  statsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  bestDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyEmoji: { fontSize: 36 },
  bestDayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bestDayAmount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  goalBadge: {
    color: COLORS.success,
    fontWeight: '700',
  },

  goalBarWrapper: {
    gap: 8,
  },
  goalBarTrack: {
    height: 12,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 6,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 6,
    minWidth: 8,
  },
  goalBarLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  bottomPadding: { height: 20 },
});
