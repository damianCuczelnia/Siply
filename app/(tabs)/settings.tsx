import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '@/hooks/useSettings';
import { resetAllData } from '@/services/storage';
import { COLORS, APP_INFO, DEFAULT_DAILY_GOAL_ML } from '@/constants';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [goalInput, setGoalInput] = useState(String(settings.dailyGoalMl));
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const handleSaveGoal = () => {
    const value = parseInt(goalInput, 10);
    if (isNaN(value) || value < 100 || value > 10000) {
      Alert.alert('Invalid value', 'Enter a goal between 100 and 10,000 ml.');
      setGoalInput(String(settings.dailyGoalMl));
    } else {
      updateSettings({ dailyGoalMl: value });
    }
    setIsEditingGoal(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset all data',
      'This will permanently delete all your water tracking history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          {/* Daily goal section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HYDRATION</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Ionicons name="water" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Daily goal</Text>
                  <Text style={styles.settingDesc}>Your target water intake per day</Text>
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

              {/* Preset goals */}
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
                      {preset / 1000}L
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Data section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATA</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingRow} onPress={handleResetData}>
                <View style={[styles.settingIcon, styles.dangerIcon]}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>Reset all data</Text>
                  <Text style={styles.settingDesc}>Delete all tracking history</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* About section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <View style={styles.card}>
              {/* App info */}
              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Text style={{ fontSize: 18 }}>💧</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{APP_INFO.name}</Text>
                  <Text style={styles.settingDesc}>Version {APP_INFO.version}</Text>
                </View>
              </View>

              {/* Author */}
              <View style={[styles.settingRow, styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Author</Text>
                  <Text style={styles.settingDesc}>{APP_INFO.author}</Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>About</Text>
                  <Text style={styles.settingDesc}>{APP_INFO.description}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineEmoji}>💧</Text>
            <Text style={styles.tagline}>{APP_INFO.tagline}</Text>
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

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  header: {
    marginBottom: 28,
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

  section: {
    marginBottom: 24,
  },
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
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F8FF',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: '#FFF0F0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dangerText: {
    color: COLORS.danger,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontWeight: '400',
  },

  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
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
  goalUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 2,
  },

  presetRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetChipTextActive: {
    color: COLORS.textWhite,
  },

  taglineContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  taglineEmoji: { fontSize: 24 },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontStyle: 'italic',
  },

  bottomPadding: { height: 20 },
});
