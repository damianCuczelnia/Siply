import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { WaterChart } from '@/components/WaterChart';
import { StatCard } from '@/components/StatCard';
import { useWaterData } from '@/hooks/useWaterData';
import { useSettings } from '@/hooks/useSettings';
import { COLORS } from '@/constants';
import { getLast7DaysKeys, formatDisplayDate } from '@/utils/dateUtils';

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 12,
        bounciness: 5,
        delay,
        useNativeDriver: true,
      } as any),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function StatisticsScreen() {
  const { weekRecords, isLoading, refresh } = useWaterData();
  const { settings } = useSettings();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const last7Days = getLast7DaysKeys();
  const goalMl    = settings.dailyGoalMl;

  const dayValues    = last7Days.map((d) => weekRecords[d]?.totalMl ?? 0);
  const daysWithData = dayValues.filter((v) => v > 0);

  const averageMl =
    daysWithData.length > 0
      ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length)
      : 0;

  const bestDayMl    = daysWithData.length > 0 ? Math.max(...daysWithData) : 0;
  const bestDayIndex = dayValues.indexOf(bestDayMl);
  const bestDate     = bestDayMl > 0 && bestDayIndex >= 0 ? last7Days[bestDayIndex] : null;

  const goalsMetCount = dayValues.filter((v) => v >= goalMl).length;
  const totalWeekMl   = dayValues.reduce((a, b) => a + b, 0);

  const mlLabel = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`;

  if (isLoading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loading}>
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </LinearGradient>
    );
  }

  const hasData = daysWithData.length > 0;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <AnimatedSection delay={0}>
            <View style={styles.header}>
              <Text style={styles.title}>Statystyki</Text>
              <Text style={styles.subtitle}>Ostatnie 7 dni — jak ci idzie?</Text>
            </View>
          </AnimatedSection>

          {hasData ? (
            <>
              <AnimatedSection delay={80}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Dzienny wynik</Text>
                  <WaterChart records={weekRecords} dates={last7Days} goalMl={goalMl} />
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                      <Text style={styles.legendText}>Spożycie</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                      <Text style={styles.legendText}>Cel osiągnięty</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                      <Text style={styles.legendText}>Linia celu</Text>
                    </View>
                  </View>
                </View>
              </AnimatedSection>

              <AnimatedSection delay={160}>
                <View style={styles.statsGrid}>
                  <View style={styles.statsRow}>
                    <StatCard iconName="stats-chart" value={mlLabel(averageMl)} label="Dzienna średnia" />
                    <StatCard iconName="trophy"       value={mlLabel(bestDayMl)} label="Najlepszy dzień" />
                  </View>
                  <View style={styles.statsRow}>
                    <StatCard iconName="checkmark-circle" value={`${goalsMetCount} / 7`} label="Cel osiągnięty" />
                    <StatCard iconName="water"             value={mlLabel(totalWeekMl)}    label="Razem w tygodniu" />
                  </View>
                </View>
              </AnimatedSection>

              {bestDate && (
                <AnimatedSection delay={240}>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Najlepsza forma</Text>
                    <View style={styles.bestDayRow}>
                      <View style={styles.trophyIcon}>
                        <Ionicons name="trophy" size={24} color={COLORS.warning} />
                      </View>
                      <View>
                        <Text style={styles.bestDayDate}>{formatDisplayDate(bestDate)}</Text>
                        <Text style={styles.bestDayAmount}>
                          {mlLabel(bestDayMl)}
                          {bestDayMl >= goalMl && (
                            <Text style={styles.goalBadge}> · Cel</Text>
                          )}
                        </Text>
                        <Text style={styles.bestDayQuip}>
                          {bestDayMl >= 3000
                            ? 'Jesteś wręcz akwarium'
                            : bestDayMl >= 2000
                            ? 'Nawodnienie na medal!'
                            : 'Dobry wynik, pracuj dalej'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </AnimatedSection>
              )}

              <AnimatedSection delay={320}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Realizacja celu</Text>
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
                        ? 'Jeszcze żadnego celu... dasz radę!'
                        : goalsMetCount === 7
                        ? 'Perfekcja! Cały tydzień!'
                        : `${Math.round((goalsMetCount / 7) * 100)}% dni w normie`}
                    </Text>
                  </View>
                </View>
              </AnimatedSection>
            </>
          ) : (
            <AnimatedSection delay={80}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="bar-chart-outline" size={52} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.emptyTitle}>Brak danych</Text>
                <Text style={styles.emptySubtitle}>
                  Zacznij śledzić wodę na zakładce Dziś, a tu pojawią się wykresy i statystyki.{'\n'}
                  Twoje nerki liczą na ciebie.
                </Text>
              </View>
            </AnimatedSection>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:    { flex: 1 },
  safeArea:    { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header:   { marginBottom: 24 },
  title:    { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

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

  legendRow: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },

  statsGrid: { gap: 12, marginBottom: 16 },
  statsRow:  { flexDirection: 'row', gap: 12 },

  bestDayRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trophyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestDayDate:   { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  bestDayAmount: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 },
  bestDayQuip:   { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  goalBadge:     { color: COLORS.success, fontWeight: '700' },

  goalBarWrapper: { gap: 8 },
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
  goalBarLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle:    { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  bottomPadding: { height: 20 },
});
