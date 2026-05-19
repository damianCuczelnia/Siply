import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '@/hooks/useSettings';
import { resetAllData } from '@/services/storage';
import { COLORS, APP_INFO } from '@/constants';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [goalInput, setGoalInput]         = useState(String(settings.dailyGoalMl));
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const handleSaveGoal = () => {
    const value = parseInt(goalInput, 10);
    if (isNaN(value) || value < 100 || value > 10000) {
      Alert.alert('Nieprawidłowa wartość', 'Wpisz cel od 100 do 10 000 ml.');
      setGoalInput(String(settings.dailyGoalMl));
    } else {
      updateSettings({ dailyGoalMl: value });
    }
    setIsEditingGoal(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Resetuj wszystkie dane',
      'Cała historia zniknie na zawsze. Naprawdę chcesz to zrobić?',
      [
        { text: 'Nie, zostawiam', style: 'cancel' },
        {
          text: 'Tak, kasuj',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Gotowe', 'Wszystkie dane zostały wyczyszczone. Świeży start!');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.title}>Ustawienia</Text>
            <Text style={styles.subtitle}>Dostosuj aplikację do siebie</Text>
          </View>

          {/* Nawodnienie */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NAWODNIENIE</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Ionicons name="water" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Dzienny cel</Text>
                  <Text style={styles.settingDesc}>
                    Ile ml chcesz wypić każdego dnia?
                  </Text>
                </View>
                {isEditingGoal ? (
                  <View style={styles.goalEditRow}>
                    <TextInput
                      style={styles.goalInput}
                      value={goalInput}
                      onChangeText={setGoalInput}
                      keyboardType="number-pad"
                      autoFocus
                      maxLength={5}
                      onBlur={handleSaveGoal}
                      onSubmitEditing={handleSaveGoal}
                      returnKeyType="done"
                    />
                    <Text style={styles.goalUnit}>ml</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.goalChip}
                    onPress={() => {
                      setGoalInput(String(settings.dailyGoalMl));
                      setIsEditingGoal(true);
                    }}
                  >
                    <Text style={styles.goalChipText}>{settings.dailyGoalMl} ml</Text>
                    <Ionicons name="pencil" size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.presetRow}>
                {[1500, 2000, 2500, 3000].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      settings.dailyGoalMl === preset && styles.presetChipActive,
                    ]}
                    onPress={() => {
                      setGoalInput(String(preset));
                      updateSettings({ dailyGoalMl: preset });
                    }}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        settings.dailyGoalMl === preset && styles.presetChipTextActive,
                      ]}
                    >
                      {preset / 1000} L
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.goalHint}>
                {settings.dailyGoalMl < 1500
                  ? 'To trochę mało — nerki proszą o więcej!'
                  : settings.dailyGoalMl >= 3000
                  ? 'Ambitny cel! Jesteś wodnym mistrzem.'
                  : 'Solidny cel — odpowiedni dla większości.'}
              </Text>
            </View>
          </View>

          {/* System kaucyjny */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SYSTEM KAUCYJNY</Text>
            <View style={styles.card}>
              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name="bag-handle-outline" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Jak to działa?</Text>
                  <Text style={styles.settingDesc}>
                    Zaznacz butelki z logo systemu kaucyjnego. Aplikacja liczy ile możesz odzyskać i przypomina o zwrocie.
                  </Text>
                </View>
              </View>

              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={[styles.settingIcon, { backgroundColor: '#EBF5FF' }]}>
                  <Ionicons name="water-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Plastik PET / Puszka</Text>
                  <Text style={styles.settingDesc}>Do 3 L (PET) lub do 1 L (puszka) — kaucja 0,50 zł</Text>
                </View>
              </View>

              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F8EF' }]}>
                  <Ionicons name="wine-outline" size={20} color={COLORS.success} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Szkło wielorazowe</Text>
                  <Text style={styles.settingDesc}>Do 1,5 L — kaucja 1,00 zł</Text>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF8EE' }]}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Gdzie oddać?</Text>
                  <Text style={styles.settingDesc}>
                    Sklepy pow. 200 m², butelkomaty, punkty zbiórki. Paragon niepotrzebny — butelka musi mieć logo kaucji i być nieuszkodzona.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Dane */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DANE</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingRow} onPress={handleResetData}>
                <View style={[styles.settingIcon, styles.dangerIcon]}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>Resetuj dane</Text>
                  <Text style={styles.settingDesc}>Usuwa całą historię. Nie ma odwrotu.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* O aplikacji */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>O APLIKACJI</Text>
            <View style={styles.card}>
              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name="water" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{APP_INFO.name}</Text>
                  <Text style={styles.settingDesc}>Wersja {APP_INFO.version}</Text>
                </View>
              </View>

              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Autor</Text>
                  <Text style={styles.settingDesc}>{APP_INFO.author}</Text>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Projekt studencki</Text>
                  <Text style={styles.settingDesc}>
                    Zbudowany w React Native i Expo. Bo nawodnienie jest ważne.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.taglineContainer}>
            <Ionicons name="water" size={20} color={COLORS.primaryLight} />
            <Text style={styles.tagline}>"{APP_INFO.tagline}"</Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header:   { marginBottom: 28 },
  title:    { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  section:      { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F8FF' },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon:   { backgroundColor: '#FFF0F0' },
  settingInfo:  { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  dangerText:   { color: COLORS.danger },
  settingDesc:  { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },

  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goalChipText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  goalInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 60,
    paddingVertical: 6,
    textAlign: 'right',
  },
  goalUnit: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginLeft: 2 },

  presetRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  presetChip:           { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.backgroundDark, alignItems: 'center' },
  presetChipActive:     { backgroundColor: COLORS.primary },
  presetChipText:       { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  presetChipTextActive: { color: COLORS.textWhite },

  goalHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    fontWeight: '500',
  },

  taglineContainer: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  bottomPadding: { height: 20 },
});
