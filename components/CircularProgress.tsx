import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '@/constants';
import { AnimatedCounter } from './AnimatedCounter';

interface Props {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  totalMl: number;
  goalMl: number;
}

export function CircularProgress({ size, strokeWidth, progress, totalMl, goalMl }: Props) {
  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped       = Math.min(progress, 1);
  const offset        = circumference * (1 - clamped);
  const center        = size / 2;
  const isGoalMet     = progress >= 1;

  // Pulse animation when goal is met
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isGoalMet) { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isGoalMet]);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, transform: [{ scale: pulse }] },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isGoalMet ? COLORS.success   : COLORS.waterStart} />
            <Stop offset="100%" stopColor={isGoalMet ? '#7FFFD4' : COLORS.waterEnd} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke={COLORS.backgroundDark} strokeWidth={strokeWidth} fill="none"
        />

        {/* Progress arc */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke="url(#grad)" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      <View style={styles.center}>
        {/* Animated counting number */}
        <View style={styles.amountRow}>
          <AnimatedCounter
            value={totalMl >= 1000 ? Math.round(totalMl / 100) / 10 : totalMl}
            style={styles.amountText}
            duration={400}
          />
          <Text style={styles.unitText}>{totalMl >= 1000 ? ' L' : ' ml'}</Text>
        </View>

        <Text style={styles.goalText}>
          {isGoalMet ? '🎉 Cel osiągnięty!' : `z ${goalMl} ml`}
        </Text>
        <Text style={styles.percentText}>{Math.round(clamped * 100)}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 17,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 5,
  },
  goalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
});
