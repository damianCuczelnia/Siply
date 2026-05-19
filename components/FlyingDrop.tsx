import React, { useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants';

interface Props {
  label: string;       // e.g. "+250 ml"
  message?: string;    // funny subtitle
  onDone: () => void;
}

// Floats a "+Xml" label upward and fades it out on mount.
export function FlyingDrop({ label, message, onDone }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 40,
        bounciness: 14,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -110,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { transform: [{ translateY }, { scale }], opacity },
      ]}
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
  },
});
