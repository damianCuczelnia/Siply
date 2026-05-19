import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  InputAccessoryView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { WaterBottle } from '@/components/WaterBottle';
import { QuickAddButton } from '@/components/QuickAddButton';
import { FlyingDrop } from '@/components/FlyingDrop';
import { useWaterData } from '@/hooks/useWaterData';
import { useSettings } from '@/hooks/useSettings';
import { COLORS, QUICK_ADD_OPTIONS, BOTTLE_OPTIONS } from '@/constants';
import { formatDisplayDate } from '@/utils/dateUtils';
import {
  getGreeting,
  ADD_REACTIONS,
  FUNNY_TOASTS,
  GOAL_MET_MESSAGES,
  randomItem,
} from '@/constants/messages';

interface FlyingDropEntry {
  id: number;
  label: string;
  message: string;
}

export default function TodayScreen() {
  const {
    todayRecord, isLoading, addWater, undoLast, refresh,
    addBottle, returnBottles, pendingBottles, pendingZl,
  } = useWaterData();
  const { settings } = useSettings();

  const [customAmountVisible, setCustomAmountVisible] = useState(false);
  const [customInput, setCustomInput]                 = useState('');
  const modalAnim  = useRef(new Animated.Value(0)).current;
  const inputRef   = useRef<TextInput>(null);
  const [flyingDrops, setFlyingDrops]                 = useState<FlyingDropEntry[]>([]);
  const dropIdRef = useRef(0);

  // Slide-in on mount
  const slideY  = useRef(new Animated.Value(30)).current;
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, speed: 12, bounciness: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  const spawnDrop = useCallback((amount: number) => {
    const id      = dropIdRef.current++;
    const message = ADD_REACTIONS[amount as keyof typeof ADD_REACTIONS] ?? randomItem(FUNNY_TOASTS);
    setFlyingDrops((prev) => [...prev, { id, label: `+${amount} ml`, message }]);

    Animated.sequence([
      Animated.spring(ringScale, { toValue: 1.06, speed: 50, bounciness: 12, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: 1,    speed: 20, bounciness: 8,  useNativeDriver: true }),
    ]).start();
  }, [ringScale]);

  const handleAddWater = useCallback(
    async (amount: number) => {
      spawnDrop(amount);
      await addWater(amount);
    },
    [addWater, spawnDrop]
  );

  const handleUndo = useCallback(async () => {
    if (!todayRecord || todayRecord.entries.length === 0) return;
    const last = todayRecord.entries[todayRecord.entries.length - 1];
    Alert.alert('Cofnij ostatni wpis', `Usunąć ${last.amount} ml?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => undoLast() },
    ]);
  }, [todayRecord, undoLast]);

  const openModal = useCallback(() => {
    setCustomAmountVisible(true);
    modalAnim.setValue(0);
    Animated.spring(modalAnim, { toValue: 1, speed: 22, bounciness: 2, useNativeDriver: true }).start();
    setTimeout(() => inputRef.current?.focus(), 250);
  }, [modalAnim]);

  const closeModal = useCallback(() => {
    Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setCustomAmountVisible(false);
      setCustomInput('');
    });
  }, [modalAnim]);

  const handleCustomAdd = useCallback(() => {
    const amount = parseInt(customInput, 10);
    if (isNaN(amount) || amount <= 0 || amount > 5000) {
      Alert.alert('Nieprawidłowa ilość', 'Wpisz wartość od 1 do 5000 ml.');
      return;
    }
    handleAddWater(amount);
    closeModal();
  }, [customInput, handleAddWater, closeModal]);

  const handleAddBottle = useCallback(async (
    kind: import('@/types').BottleKind,
    sizeL: number,
    depositZl: number,
    amountMl: number,
  ) => {
    spawnDrop(amountMl);
    await addBottle(kind, sizeL, depositZl, amountMl);
  }, [addBottle, spawnDrop]);

  const handleReturnBottles = useCallback(() => {
    if (pendingBottles === 0) return;
    const zlStr = pendingZl.toFixed(2);
    const label = pendingBottles === 1 ? 'butelkę' : pendingBottles < 5 ? 'butelki' : 'butelek';
    Alert.alert(
      'Oddajesz butelki',
      `Zwracasz ${pendingBottles} ${label} i zgarniasz ${zlStr} zł kaucji. Tak?`,
      [
        { text: 'Nie teraz', style: 'cancel' },
        {
          text: `Tak, biorę ${zlStr} zł!`,
          onPress: () => returnBottles(pendingBottles, pendingZl),
        },
      ],
    );
  }, [pendingBottles, pendingZl, returnBottles]);

  const todayBottles = todayRecord?.bottles?.length ?? 0;

  const totalMl   = todayRecord?.totalMl ?? 0;
  const goalMl    = settings.dailyGoalMl;
  const progress  = goalMl > 0 ? totalMl / goalMl : 0;
  const remaining = Math.max(goalMl - totalMl, 0);
  const isGoalMet = totalMl > 0 && remaining === 0;
  const goalMetMsg = isGoalMet ? randomItem(GOAL_MET_MESSAGES) : '';

  if (isLoading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loading}>
        <Text style={styles.loadingText}>Ładowanie...</Text>
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
          <Animated.View
            style={[styles.flex, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}
          >
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>{getGreeting()}</Text>
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

              {/* Progress ring + flying drops */}
              <View style={styles.ringWrapper}>
                <Animated.View style={{ transform: [{ scale: ringScale }] }}>
                  <WaterBottle
                    progress={progress}
                    totalMl={totalMl}
                    goalMl={goalMl}
                  />
                </Animated.View>
                {flyingDrops.map((drop) => (
                  <FlyingDrop
                    key={drop.id}
                    label={drop.label}
                    message={drop.message}
                    onDone={() =>
                      setFlyingDrops((prev) => prev.filter((d) => d.id !== drop.id))
                    }
                  />
                ))}
              </View>

              {/* Status chip */}
              {remaining > 0 && (
                <View style={styles.chip}>
                  <Ionicons name="water-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.chipText}>Jeszcze {remaining} ml do celu</Text>
                </View>
              )}
              {isGoalMet && (
                <View style={[styles.chip, styles.chipSuccess]}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <Text style={[styles.chipText, styles.chipSuccessText]}>{goalMetMsg}</Text>
                </View>
              )}

              {/* Quick add */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Szybki dodaj</Text>
                <View style={styles.quickAddRow}>
                  {QUICK_ADD_OPTIONS.map((amount) => (
                    <QuickAddButton key={amount} amount={amount} onPress={handleAddWater} />
                  ))}
                </View>
              </View>

              {/* Custom amount */}
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={openModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.customAddText}>Własna ilość</Text>
              </TouchableOpacity>

              {/* Bottle deposit section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Butelki kaucjonowane</Text>
                  <Text style={styles.sectionHint}>tapnij = dodaj + woda</Text>
                </View>
                <View style={styles.bottleGrid}>
                  {BOTTLE_OPTIONS.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.bottleBtn, { borderColor: opt.color + '40' }]}
                      activeOpacity={0.75}
                      onPress={() => handleAddBottle(opt.kind, opt.sizeL, opt.depositZl, opt.amountMl)}
                    >
                      <Ionicons name={opt.icon as any} size={18} color={opt.color} />
                      <Text style={[styles.bottleBtnLabel, { color: opt.color }]}>{opt.label}</Text>
                      <Text style={styles.bottleBtnSub}>{opt.sublabel}</Text>
                      <View style={[styles.depositBadge, { backgroundColor: opt.color + '20' }]}>
                        <Text style={[styles.depositBadgeText, { color: opt.color }]}>
                          {opt.depositZl.toFixed(2)} zł
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {pendingBottles > 0 && (
                  <View style={styles.pendingCard}>
                    <View style={styles.pendingInfo}>
                      <Ionicons name="bag-handle-outline" size={22} color={COLORS.warning} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pendingTitle}>
                          {pendingBottles} {pendingBottles === 1 ? 'butelka' : pendingBottles < 5 ? 'butelki' : 'butelek'} do oddania
                        </Text>
                        <Text style={styles.pendingValue}>
                          Kaucja: {pendingZl.toFixed(2)} zł
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.returnBtn} onPress={handleReturnBottles}>
                      <Text style={styles.returnBtnText}>Oddaję!</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {todayBottles > 0 && pendingBottles === 0 && (
                  <View style={styles.allReturnedBanner}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.allReturnedText}>Wszystkie butelki oddane</Text>
                  </View>
                )}
              </View>

              {/* Today's log */}
              {todayRecord && todayRecord.entries.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dzisiejszy dziennik</Text>
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
                          <View style={styles.logIconWrapper}>
                            <Ionicons name="water" size={14} color={COLORS.primary} />
                          </View>
                          <Text style={styles.logAmount}>+{entry.amount} ml</Text>
                          <Text style={styles.logTime}>
                            {new Date(entry.timestamp).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      ))}
                    {todayRecord.entries.length > 5 && (
                      <Text style={styles.moreEntries}>
                        +{todayRecord.entries.length - 5} więcej wpisów
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Empty state */}
              {(!todayRecord || todayRecord.entries.length === 0) && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrapper}>
                    <Ionicons name="water-outline" size={48} color={COLORS.primaryLight} />
                  </View>
                  <Text style={styles.emptyTitle}>Zacznij śledzić!</Text>
                  <Text style={styles.emptySubtitle}>
                    Twoje nerki już czekają. Kliknij przycisk powyżej!
                  </Text>
                </View>
              )}

              <View style={styles.bottomPadding} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom amount modal */}
      <Modal
        visible={customAmountVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Overlay — fade in */}
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: modalAnim },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closeModal}
            />

            {/* Card — slide up */}
            <Animated.View
              style={[
                styles.modalCard,
                {
                  transform: [{
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.modalTitle}>Ile wypiłeś?</Text>
              <Text style={styles.modalSubtitle}>Wpisz ilość w mililitrach</Text>

              <Text style={styles.inputLabel}>Ilość (ml)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={customInput}
                  onChangeText={setCustomInput}
                  placeholder="np. 400"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                  ref={inputRef}
                  returnKeyType="done"
                  onSubmitEditing={handleCustomAdd}
                  maxLength={4}
                  selectionColor={COLORS.primary}
                  underlineColorAndroid="transparent"
                  inputAccessoryViewID="waterAmount"
                />
                <View style={styles.inputUnitBox}>
                  <Text style={styles.inputUnit}>ml</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                  <Text style={styles.modalCancelText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleCustomAdd}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.modalConfirmText}>Dodaj</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="waterAmount">
          <View style={styles.accessory}>
            <TouchableOpacity onPress={closeModal} style={styles.accessoryCancel}>
              <Text style={styles.accessoryCancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCustomAdd} style={styles.accessoryConfirm}>
              <Text style={styles.accessoryConfirmText}>Dodaj</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea:  { flex: 1 },
  flex:      { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  dateText:  { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },
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

  ringWrapper: { alignItems: 'center', marginBottom: 16 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chipSuccess:     { backgroundColor: '#E8F8F0' },
  chipText:        { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  chipSuccessText: { color: COLORS.success },

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
    borderColor: '#D0E8F8',
    borderStyle: 'dashed',
  },
  customAddText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },

  logCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    overflow: 'hidden',
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
  logIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAmount: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  logTime:   { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  moreEntries: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingVertical: 10,
    fontWeight: '500',
  },

  emptyState:     { alignItems: 'center', paddingVertical: 32 },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },

  bottomPadding: { height: 20 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,60,90,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 16,
  },
  modalCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F4F9FE',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    marginBottom: 20,
    height: 68,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  inputUnitBox: {
    backgroundColor: '#E0F0FB',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  inputUnit: { fontSize: 16, color: COLORS.primary, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  modalConfirm: {
    flex: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: { fontSize: 15, color: COLORS.textWhite, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionHint:   { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },

  bottleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  bottleBtn: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1.5,
    gap: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bottleBtnLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  bottleBtnSub:   { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  depositBadge:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  depositBadgeText: { fontSize: 11, fontWeight: '700' },

  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE0A0',
  },
  pendingInfo:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pendingTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  pendingValue: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },
  returnBtn: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  returnBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  allReturnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  allReturnedText: { fontSize: 13, color: COLORS.success, fontWeight: '600' },

  accessory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: '#E8F0F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  accessoryCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  accessoryCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  accessoryConfirm: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  accessoryConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});
