import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '@/constants';

interface Props {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  totalMl: number;
  goalMl: number;
}

export function CircularProgress({ size, strokeWidth, progress, totalMl, goalMl }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(progress, 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const center = size / 2;
  const isGoalMet = progress >= 1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isGoalMet ? COLORS.success : COLORS.waterStart} />
            <Stop offset="100%" stopColor={isGoalMet ? '#7FFFD4' : COLORS.waterEnd} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.backgroundDark}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.centerContent}>
        <Text style={styles.amountText}>
          {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}`}
        </Text>
        {totalMl < 1000 && <Text style={styles.unitText}>ml</Text>}
        <Text style={styles.goalText}>
          {isGoalMet ? '🎉 Goal met!' : `of ${goalMl} ml`}
        </Text>
        <Text style={styles.percentText}>{Math.round(clampedProgress * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: -4,
  },
  goalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
});
