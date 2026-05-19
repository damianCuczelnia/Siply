import React, { useRef, useEffect } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface Props {
  value: number;
  style?: TextStyle;
  duration?: number;
  /** Decimal places to show, default 0 */
  decimals?: number;
}

export function AnimatedCounter({ value, style, duration = 500, decimals = 0 }: Props) {
  const animValue = useRef(new Animated.Value(value)).current;
  const prevValue = useRef(value);
  const [display, setDisplay] = React.useState(value.toFixed(decimals));

  useEffect(() => {
    if (value === prevValue.current) return;

    const listener = animValue.addListener(({ value: v }) => {
      setDisplay(v.toFixed(decimals));
    });

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start(() => {
      animValue.removeListener(listener);
      // Ensure final value is exact
      setDisplay(value.toFixed(decimals));
    });

    prevValue.current = value;
    return () => animValue.removeListener(listener);
  }, [value, duration, decimals, animValue]);

  return <Text style={style}>{display}</Text>;
}
