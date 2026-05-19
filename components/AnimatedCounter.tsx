import React, { useRef, useEffect } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface Props {
  value: number;
  style?: TextStyle;
  duration?: number;
}

// Counts up from the previous value to the new value smoothly.
export function AnimatedCounter({ value, style, duration = 500 }: Props) {
  const animValue = useRef(new Animated.Value(value)).current;
  const prevValue = useRef(value);
  const displayRef = useRef(value);

  const [display, setDisplay] = React.useState(value);

  useEffect(() => {
    if (value === prevValue.current) return;

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animValue.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });

    prevValue.current = value;
    return () => animValue.removeListener(listener);
  }, [value, duration, animValue]);

  return <Text style={style}>{display}</Text>;
}
