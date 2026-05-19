import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '@/constants';
import { AnimatedCounter } from './AnimatedCounter';

// ─── SVG geometry ─────────────────────────────────────────────────────────────

const W  = 120;
const H  = 240;

const NL = 42, NR = 78;          // neck x (left / right)
const NY = 22, NB = 52;          // neck y (top / bottom)
const SB = 74;                   // shoulder bottom y
const BL = 10, BR = 110;         // body x (left / right)
const BB = 212;                  // body bottom y
const CR = 18;                   // body corner radius

const FILL_H = BB - NY;          // total fillable height in SVG units

const BOTTLE_PATH = [
  `M ${NL},${NY} L ${NR},${NY} L ${NR},${NB}`,
  `C ${NR},${NB + 14} ${BR},${SB - 4} ${BR},${SB}`,
  `L ${BR},${BB - CR}`,
  `Q ${BR},${BB} ${BR - CR},${BB}`,
  `L ${BL + CR},${BB}`,
  `Q ${BL},${BB} ${BL},${BB - CR}`,
  `L ${BL},${SB}`,
  `C ${BL},${SB - 4} ${NL},${NB + 14} ${NL},${NB}`,
  'Z',
].join(' ');

// ─── Wave path ────────────────────────────────────────────────────────────────

const WAVE_PW = W * 1.6;
const WAVE_A  = 4;

function makeWave(surfaceY: number): string {
  const sx = -WAVE_PW * 4;
  let d = `M ${sx},${surfaceY}`;
  for (let i = 0; i < 12; i++) {
    const x = sx + i * WAVE_PW;
    d += ` C ${x + WAVE_PW * 0.25},${surfaceY - WAVE_A} ${x + WAVE_PW * 0.75},${surfaceY - WAVE_A} ${x + WAVE_PW},${surfaceY}`;
    d += ` C ${x + WAVE_PW * 1.25},${surfaceY + WAVE_A} ${x + WAVE_PW * 1.75},${surfaceY + WAVE_A} ${x + WAVE_PW * 2},${surfaceY}`;
  }
  d += ` L ${sx + 12 * WAVE_PW * 2},${H + 10} L ${sx},${H + 10} Z`;
  return d;
}

// ─── Bubble ──────────────────────────────────────────────────────────────────

function BubbleParticle({ fillPx, onDone }: { fillPx: number; onDone: () => void }) {
  const startX   = (Math.random() - 0.5) * (BR - BL - 30);
  const driftX   = (Math.random() - 0.5) * 20;
  const bSize    = 5 + Math.random() * 8;
  const duration = 800 + Math.random() * 500;

  const ty = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(startX)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(Math.random() * 200),
      Animated.parallel([
        Animated.timing(op, { toValue: 0.75, duration: 150, useNativeDriver: true }),
        Animated.spring(sc, { toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true }),
        Animated.timing(ty, {
          toValue: -Math.max(fillPx * 0.55, 24),
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tx, { toValue: startX + driftX, duration, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sc, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: bSize, height: bSize, borderRadius: bSize / 2,
        backgroundColor: 'rgba(255,255,255,0.75)',
        bottom: H - BB + 16,
        alignSelf: 'center',
        opacity: op,
        transform: [{ translateY: ty }, { translateX: tx }, { scale: sc }],
      }}
    />
  );
}

// ─── WaterBottle ──────────────────────────────────────────────────────────────

interface Props {
  progress: number;
  totalMl:  number;
  goalMl:   number;
}

export function WaterBottle({ progress, totalMl, goalMl }: Props) {
  const clamped   = Math.min(progress, 1);
  const isGoalMet = progress >= 1;

  // Fill level (drives SVG)
  const animFill  = useRef(new Animated.Value(0)).current;
  const [fill, setFill] = useState(0);
  const prevMl    = useRef(totalMl);
  const [bubbles, setBubbles] = useState<number[]>([]);
  const bubbleId  = useRef(0);

  useEffect(() => {
    const id = animFill.addListener(({ value }) => setFill(value));
    Animated.timing(animFill, {
      toValue: clamped, duration: 1800,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
    return () => animFill.removeListener(id);
  }, []);

  useEffect(() => {
    if (totalMl <= prevMl.current) { prevMl.current = totalMl; return; }
    prevMl.current = totalMl;
    const id = animFill.addListener(({ value }) => setFill(value));
    Animated.timing(animFill, {
      toValue: clamped, duration: 1400,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start(() => animFill.removeListener(id));
    const count = 4 + Math.floor(Math.random() * 3);
    setBubbles(prev => [...prev, ...Array.from({ length: count }, () => bubbleId.current++)]);
  }, [totalMl]);

  // Wave
  const waveAnim = useRef(new Animated.Value(0)).current;
  const [waveOffset, setWaveOffset] = useState(0);
  useEffect(() => {
    const id = waveAnim.addListener(({ value }) => setWaveOffset(value));
    Animated.loop(
      Animated.timing(waveAnim, { toValue: WAVE_PW, duration: 2400, easing: Easing.linear, useNativeDriver: false })
    ).start();
    return () => waveAnim.removeListener(id);
  }, []);

  // Pulse on goal met
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isGoalMet) { pulse.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [isGoalMet]);

  const surfaceY = BB - FILL_H * fill;
  const wavePath = makeWave(surfaceY);
  const fillPx   = FILL_H * fill;

  const c1 = isGoalMet ? COLORS.success : COLORS.waterStart;
  const c2 = isGoalMet ? '#7FFFD4'      : COLORS.waterEnd;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <ClipPath id="btlClip">
            <Path d={BOTTLE_PATH} />
          </ClipPath>
          <LinearGradient id="btlWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor={c2} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={c1} stopOpacity={0.95} />
          </LinearGradient>
        </Defs>

        {/* Empty bottle background */}
        <Path d={BOTTLE_PATH} fill={COLORS.backgroundDark} />

        {/* Water fill with wave */}
        <G clipPath="url(#btlClip)">
          <G transform={`translate(${-waveOffset}, 0)`}>
            <Path d={wavePath} fill="url(#btlWater)" />
          </G>
        </G>

        {/* Bottle outline */}
        <Path
          d={BOTTLE_PATH} fill="none"
          stroke={isGoalMet ? COLORS.success : COLORS.primary}
          strokeWidth={2.5}
        />

        {/* Cap */}
        <Rect
          x={NL + 3} y={5} width={NR - NL - 6} height={NY - 7} rx={4}
          fill={isGoalMet ? COLORS.success : COLORS.primaryDark}
        />
        <Rect
          x={NL + 7} y={7} width={(NR - NL - 14) * 0.45} height={NY - 12} rx={2}
          fill="white" opacity={0.25}
        />
      </Svg>

      {/* Bubbles */}
      {bubbles.map(id => (
        <BubbleParticle key={id} fillPx={fillPx} onDone={() => setBubbles(prev => prev.filter(b => b !== id))} />
      ))}

      {/* Text overlay */}
      <View pointerEvents="none" style={styles.textWrap}>
        <View style={styles.textBg}>
          <View style={styles.amountRow}>
            <AnimatedCounter
              value={totalMl >= 1000 ? totalMl / 1000 : totalMl}
              decimals={totalMl >= 1000 ? 1 : 0}
              style={styles.amountText}
              duration={1200}
            />
            <Text style={styles.unitText}>{totalMl >= 1000 ? ' L' : ' ml'}</Text>
          </View>
          <Text style={styles.goalText}>
            {isGoalMet ? 'Cel osiągnięty!' : `z ${goalMl} ml`}
          </Text>
          <Text style={styles.pctText}>{Math.round(clamped * 100)}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const BODY_CENTER_Y = (SB + BB) / 2;   // ≈ 143 — center of bottle body

const styles = StyleSheet.create({
  container: { width: W, height: H },
  textWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    top: BODY_CENTER_Y - 46,
  },
  textBg: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.52)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  amountRow:  { flexDirection: 'row', alignItems: 'flex-end' },
  amountText: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -1 },
  unitText:   { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 3 },
  goalText:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 1, fontWeight: '500' },
  pctText:    { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
});
