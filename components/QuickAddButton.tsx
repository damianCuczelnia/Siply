import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { COLORS } from '@/constants';

interface Props {
  amount: number;
  onPress: (amount: number) => void;
  style?: ViewStyle;
}

export function QuickAddButton({ amount, onPress, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress(amount);
  };

  return (
    <Animated.View style={[styles.button, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={styles.inner}
      >
        <Text style={styles.amountText}>+{amount}</Text>
        <Text style={styles.unitText}>ml</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E0F0FB',
    overflow: 'hidden',
  },
  inner: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
