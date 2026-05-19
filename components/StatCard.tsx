import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  iconName: IconName;
  value: string;
  label: string;
  style?: ViewStyle;
}

export function StatCard({ iconName, value, label, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={iconName} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F4FB',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
});
