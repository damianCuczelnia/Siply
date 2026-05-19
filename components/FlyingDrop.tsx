import React, { useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, View, Easing } from 'react-native';
import { COLORS } from '@/constants';

interface Props {
  label: string;
  message?: string;
  onDone: () => void;
}

export function FlyingDrop({ label, message, onDone }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Wyskocz i powiększ się (wiosna, szybko)
      Animated.spring(scale, {
        toValue: 1,
        speed: 28,
        bounciness: 18,
        useNativeDriver: true,
      }),
      // 2. Unoś się powoli w górę przez 700ms — bańka "płynie"
      Animated.timing(translateY, {
        toValue: -55,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 3. Wisz w miejscu przez 900ms żeby można było przeczytać
      Animated.delay(900),
      // 4. Odleć w górę i znikaj
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -160,
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.7,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY }, { scale }], opacity }]}
    >
      <View style={styles.bubble}>
        <Text style={styles.label}>{label}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  bubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  message: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 200,
  },
});
