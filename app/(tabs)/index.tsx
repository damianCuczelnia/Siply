import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { CircularProgress } from '@/components/CircularProgress';
import { QuickAddButton } from '@/components/QuickAddButton';
import { useWaterData } from '@/hooks/useWaterData';
import { useSettings } from '@/hooks/useSettings';
import { COLORS, QUICK_ADD_OPTIONS } from '@/constants';
import { formatDisplayDate } from '@/utils/dateUtils';

export default function TodayScreen() {
  const { todayRecord, isLoading, addWater, undoLast, refresh } = useWaterData();
  const { settings } = useSettings();

  const [customAmountVisible, setCustomAmountVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const progressScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddWater = useCallback(
    async (amount: number) => {
      Animated.sequence([
        Animated.spring(progressScale, { toValue: 1.03, useNativeDriver: true, speed: 50 }),
        Animated.spring(progressScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
      await addWater(amount);
    },
    [addWater, progressScale]
  );

  const handleUndo = useCallback(async () => {
    if (!todayRecord || todayRecord.entries.length === 0) return;
    const last = todayRecord.entries[todayRecord.entries.length - 1];
    Alert.alert('Undo last entry', `Remove ${last.amount} ml?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => undoLast() },
    ]);
  }, [todayRecord, undoLast]);

  const handleCustomAdd = useCallback(() => {
    const amount = parseInt(customInput, 10);
    if (isNaN(amount) || amount <= 0 || amount > 5000) {
      Alert.alert('Invalid amount', 'Enter a value between 1 and 5000 ml.');
      return;
    }
    handleAddWater(amount);
    setCustomInput('');
    setCustomAmountVisible(false);
  }, [customInput, handleAddWater]);

  const totalMl = todayRecord?.totalMl ?? 0;
  const goalMl = settings.dailyGoalMl;
  const progress = goalMl > 0 ? totalMl / goalMl : 0;
  const remaining = Math.max(goalMl - totalMl, 0);

  if (isLoading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loading}>
        <Text style={styles.loadingText}>💧</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good hydration 💧</Text>
                <Text style={styles.dateText}>
                  {formatDisplayDate(todayRecord?.date ?? '')}
                </Text>
              </View>
              {todayRecord && todayRecord.entries.length > 0 && (
                <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
                  <Ionicons name="arrow-undo" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress ring */}
            <Animated.View
              style={[
                styles.progressContainer,
                { transform: [{ scale: progressScale }] },
              ]}
            >
              <CircularProgress
                size={220}
                strokeWidth={18}
                progress={progress}
                totalMl={totalMl}
                goalMl={goalMl}
              />
            </Animated.View>

            {/* Remaining / goal met chip */}
            {remaining > 0 && (
              <View style={styles.remainingChip}>
                <Text style={styles.remainingText}>{remaining} ml to go</Text>
              </View>
            )}
            {remaining === 0 && totalMl > 0 && (
              <View style={[styles.remainingChip, styles.successChip]}>
                <Text style={[styles.remainingText, styles.successText]}>
                  Daily goal achieved! 🎉
                </Text>
              </View>
            )}

            {/* Quick add */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Add</Text>
              <View style={styles.quickAddRow}>
                {QUICK_ADD_OPTIONS.map((amount) => (
                  <QuickAddButton key={amount} amount={amount} onPress={handleAddWater} />
                ))}
              </View>
            </View>

            {/* Custom amount */}
            <TouchableOpacity
              style={styles.customAddButton}
              onPress={() => setCustomAmountVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.customAddText}>Custom amount</Text>
            </TouchableOpacity>

            {/* Today's log */}
            {todayRecord && todayRecord.entries.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's log</Text>
                <View style={styles.logCard}>
                  {[...todayRecord.entries]
                    .reverse()
                    .slice(0, 5)
                    .map((entry, i) => (
                      <View
                        key={entry.id}
                        style={[
                          styles.logRow,
                          i < Math.min(todayRecord.entries.length, 5) - 1 &&
                            styles.logRowBorder,
                        ]}
                      >
                        <Text style={styles.logEmoji}>💧</Text>
                        <Text style={styles.logAmount}>+{entry.amount} ml</Text>
                        <Text style={styles.logTime}>
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    ))}
                  {todayRecord.entries.length > 5 && (
                    <Text style={styles.moreEntries}>
                      +{todayRecord.entries.length - 5} more entries
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Empty state */}
            {(!todayRecord || todayRecord.entries.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌊</Text>
                <Text style={styles.emptyTitle}>Start tracking</Text>
                <Text style={styles.emptySubtitle}>
                  Tap a quick add button above to log your first drink today.
                </Text>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom amount modal */}
      <Modal
        visible={customAmountVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomAmountVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCustomAmountVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom amount</Text>
            <Text style={styles.modalSubtitle}>How much did you drink?</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="e.g. 400"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCustomAdd}
                maxLength={4}
              />
              <Text style={styles.inputUnit}>ml</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCustomAmountVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCustomAdd}>
                <Text style={styles.modalConfirmText}>Add 💧</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 48 },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  undoButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  progressContainer: { alignItems: 'center', marginBottom: 16 },

  remainingChip: {
    alignSelf: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  successChip: { backgroundColor: '#E8F8F0' },
  remainingText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  successText: { color: COLORS.success },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  quickAddRow: { flexDirection: 'row', gap: 10 },

  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#E0F0FB',
    borderStyle: 'dashed',
  },
  customAddText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },

  logCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    padding: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F8FF' },
  logEmoji: { fontSize: 16 },
  logAmount: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  logTime: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  moreEntries: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingVertical: 10,
    fontWeight: '500',
  },

  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },

  bottomPadding: { height: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,60,90,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  inputUnit: { fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  modalConfirm: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 15, color: COLORS.textWhite, fontWeight: '700' },
});
