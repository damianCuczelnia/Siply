import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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

// ─── Bubble particle ─────────────────────────────────────────────────────────

interface BubbleProps {
  size: number;
  onDone: () => void;
}

function BubbleParticle({ size, onDone }: BubbleProps) {
  const startX   = (Math.random() - 0.5) * size * 0.5;
  const driftX   = (Math.random() - 0.5) * 30;
  const bubbleSize = 6 + Math.random() * 10;
  const duration = 900 + Math.random() * 600;
  const delay    = Math.random() * 250;

  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Pojawia się
        Animated.timing(opacity, { toValue: 0.85, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true }),
        // Płynie w górę z lekkim dryftem
        Animated.timing(translateY, {
          toValue: -(size * 0.55 + Math.random() * 20),
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + driftX,
          duration,
          useNativeDriver: true,
        }),
      ]),
      // Znika na górze
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: bubbleSize,
        height: bubbleSize,
        borderRadius: bubbleSize / 2,
        backgroundColor: COLORS.waterStart,
        bottom: size * 0.05,
        alignSelf: 'center',
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
}

// ─── CircularProgress ─────────────────────────────────────────────────────────

export function CircularProgress({ size, strokeWidth, progress, totalMl, goalMl }: Props) {
  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center        = size / 2;
  const isGoalMet     = progress >= 1;

  // Animated fill value (drives the SVG strokeDashoffset)
  const animFill   = useRef(new Animated.Value(0)).current;
  const [svgFill, setSvgFill] = useState(0); // 0 = pusty, 1 = pełny

  // Bubble particles list
  const [bubbles, setBubbles] = useState<number[]>([]);
  const bubbleId   = useRef(0);
  const prevTotalMl = useRef(totalMl);

  // First mount: animate from 0 to current progress (wolno, efektownie)
  useEffect(() => {
    const id = animFill.addListener(({ value }) => setSvgFill(value));
    Animated.timing(animFill, {
      toValue: Math.min(progress, 1),
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animFill.removeListener(id);
  }, []);

  // When progress changes after mount: fill up + spawn bubbles
  useEffect(() => {
    if (totalMl <= prevTotalMl.current) {
      prevTotalMl.current = totalMl;
      return;
    }
    prevTotalMl.current = totalMl;

    // Animuj nowe napełnienie
    const id = animFill.addListener(({ value }) => setSvgFill(value));
    Animated.timing(animFill, {
      toValue: Math.min(progress, 1),
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => animFill.removeListener(id));

    // Spawnu 4-6 bąbelków
    const count = 4 + Math.floor(Math.random() * 3);
    const ids = Array.from({ length: count }, () => bubbleId.current++);
    setBubbles((prev) => [...prev, ...ids]);
  }, [totalMl]);

  // Pulsowanie gdy cel osiągnięty
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isGoalMet) { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isGoalMet]);

  const offset = circumference * (1 - svgFill);

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
            <Stop offset="0%"   stopColor={isGoalMet ? COLORS.success : COLORS.waterStart} />
            <Stop offset="100%" stopColor={isGoalMet ? '#7FFFD4'      : COLORS.waterEnd}   />
          </LinearGradient>
        </Defs>

        {/* Track (szare tło) */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke={COLORS.backgroundDark} strokeWidth={strokeWidth} fill="none"
        />

        {/* Napełniający się łuk */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke="url(#grad)" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      {/* Bąbelki bulgotania */}
      {bubbles.map((id) => (
        <BubbleParticle
          key={id}
          size={size}
          onDone={() =>
            setBubbles((prev) => prev.filter((b) => b !== id))
          }
        />
      ))}

      {/* Środek — licznik + info */}
      <View style={styles.center} pointerEvents="none">
        <View style={styles.amountRow}>
          <AnimatedCounter
            value={totalMl >= 1000 ? Math.round(totalMl / 10) / 100 : totalMl}
            style={styles.amountText}
            duration={1200}
          />
          <Text style={styles.unitText}>{totalMl >= 1000 ? ' L' : ' ml'}</Text>
        </View>
        <Text style={styles.goalText}>
          {isGoalMet ? 'Cel osiągnięty!' : `z ${goalMl} ml`}
        </Text>
        <Text style={styles.percentText}>{Math.round(Math.min(progress, 1) * 100)}%</Text>
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
